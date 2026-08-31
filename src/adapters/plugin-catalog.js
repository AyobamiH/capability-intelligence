import fs from "node:fs";
import path from "node:path";
import { createArtifact, componentRisk } from "../model.js";
import { inferCapabilities } from "../classify.js";
import { parseSkillFile } from "./skills.js";
import {
  extractCapabilityLabels,
  readJson,
  safeText,
  slugify,
  stableHash,
  walkFiles,
} from "../utils.js";

const COMPONENT_DIRECTORIES = {
  agents: "agent",
  commands: "command",
  hooks: "hook",
  scripts: "helper-script",
  ui: "ui",
  workflows: "workflow",
  schemas: "schema",
};

export function scanPluginCatalog(config) {
  const root = path.join(config.codexRoot, ".tmp", "plugins");
  const pluginsRoot = path.join(root, "plugins");
  if (!fs.existsSync(pluginsRoot)) {
    return empty("codex-plugin-catalog");
  }

  const artifacts = [];
  const edges = [];
  const findings = [];
  const installedNames = installedPluginNames(config.codexRoot);
  const manifests = fs
    .readdirSync(pluginsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(pluginsRoot, entry.name, ".codex-plugin", "plugin.json"))
    .filter((file) => fs.existsSync(file))
    .sort();
  const marketplaceRecords = marketplacePlugins(root, findings);
  const manifestNames = new Set(manifests.map((file) => path.basename(path.dirname(path.dirname(file)))));
  let parseFailures = 0;
  let skillRecords = 0;
  let skillRepresented = 0;
  let unlabelled = 0;
  let integrationRecords = 0;

  for (const manifestPath of manifests) {
    try {
      const manifest = readJson(manifestPath);
      const pluginDirectory = path.dirname(path.dirname(manifestPath));
      const slug = slugify(manifest.name || path.basename(pluginDirectory));
      const pluginId = `plugin:${slug}`;
      const declared = extractCapabilityLabels(manifest.interface?.capabilities);
      const inferred = inferCapabilities(
        manifest.name,
        manifest.description,
        manifest.interface?.displayName,
        manifest.interface?.shortDescription,
        manifest.interface?.category,
        ...(manifest.keywords || []),
      );
      const hasLabels = declared.length > 0;
      if (!hasLabels) unlabelled += 1;
      const surfaces = pluginSurfaces(manifest, pluginDirectory);
      artifacts.push(
        createArtifact({
          id: pluginId,
          type: "plugin",
          name: manifest.interface?.displayName || manifest.name,
          description: manifest.interface?.shortDescription || manifest.description,
          source: "codex-plugin-catalog",
          hosts: ["codex"],
          capabilities: hasLabels ? declared : inferred,
          classificationEvidence: hasLabels ? "declared" : inferred.length ? "inferred" : "structural",
          lifecycle: {
            discovered: "yes",
            present: "yes",
            installed: installedNames.has(manifest.name) ? "yes" : "no",
            enabled: "unknown",
            authenticated: "unknown",
            runnable: "unknown",
            verified: "unknown",
          },
          risk: surfaces.hooks || surfaces.scripts || surfaces.mcpServers
            ? { level: "medium", reasons: ["plugin contains executable integration surfaces"] }
            : { level: "low", reasons: [] },
          metadata: {
            version: safeText(manifest.version, 40) || null,
            category: safeText(manifest.interface?.category, 80) || null,
            manifestCapabilityStatus: hasLabels ? "labelled" : "unlabelled",
            surfaces,
          },
        }),
      );

      for (const [field, type, label] of [
        ["apps", "app-integration", "app integration"],
        ["mcpServers", "mcp-server", "MCP server"],
      ]) {
        const entries = declarationEntries(manifest[field]);
        integrationRecords += entries.length;
        entries.forEach((entry, index) => {
          const componentId = `${type}:plugin:${slug}:${index + 1}`;
          artifacts.push(
            createArtifact({
              id: componentId,
              type,
              name: `${manifest.interface?.displayName || manifest.name} ${label}`,
              description: `${label} declared by ${manifest.interface?.displayName || manifest.name}.`,
              source: "codex-plugin-catalog",
              hosts: ["codex"],
              capabilities: inferred,
              classificationEvidence: "structural",
              lifecycle: {
                discovered: "yes",
                present: "yes",
                installed: installedNames.has(manifest.name) ? "yes" : "no",
                enabled: "unknown",
                authenticated: "unknown",
                runnable: "unknown",
                verified: "unknown",
              },
              risk: componentRisk(type),
              metadata: { provider: pluginId, declarationKind: field, declarationShape: entry.shape },
            }),
          );
          edges.push({ from: pluginId, to: componentId, type: "provides" });
        });
      }

      const skillFiles = walkFiles(pluginDirectory, (file) => path.basename(file) === "SKILL.md");
      skillRecords += skillFiles.length;
      for (const skillFile of skillFiles) {
        try {
          const relative = path.relative(pluginDirectory, skillFile).split(path.sep).join("/");
          const skill = parseSkillFile(skillFile, {
            sourceKey: `plugin-${slug}`,
            pathKey: slugify(relative),
            source: "codex-plugin-catalog",
            hosts: ["codex"],
            installed: installedNames.has(manifest.name),
            relativeLocation: `plugin:${slug}/${relative}`,
          });
          artifacts.push(skill);
          edges.push({ from: pluginId, to: skill.id, type: "contains" });
          skillRepresented += 1;
        } catch {
          findings.push({
            level: "error",
            code: "plugin_skill_parse_failed",
            source: "codex-plugin-catalog",
            message: "A bundled plugin skill could not be parsed safely.",
          });
        }
      }

      for (const [directoryName, type] of Object.entries(COMPONENT_DIRECTORIES)) {
        const componentRoot = path.join(pluginDirectory, directoryName);
        for (const file of walkFiles(componentRoot)) {
          if (path.basename(file) === "SKILL.md") continue;
          const relative = path.relative(componentRoot, file).split(path.sep).join("/");
          const componentId = `${type}:plugin:${slug}:${stableHash(relative)}`;
          artifacts.push(
            createArtifact({
              id: componentId,
              type,
              name: componentDisplayName(relative, type, manifest.interface?.displayName || manifest.name),
              description: `${type} supplied by ${manifest.interface?.displayName || manifest.name}`,
              source: "codex-plugin-catalog",
              hosts: ["codex"],
              capabilities: inferCapabilities(relative, manifest.description),
              classificationEvidence: "structural",
              lifecycle: {
                discovered: "yes",
                present: "yes",
                installed: installedNames.has(manifest.name) ? "yes" : "no",
                enabled: "unknown",
                authenticated: "unknown",
                runnable: "unknown",
                verified: "unknown",
              },
              risk: componentRisk(type),
              metadata: { provider: pluginId, relativeLocation: `${directoryName}/${relative}` },
            }),
          );
          edges.push({ from: pluginId, to: componentId, type: "contains" });
        }
      }
    } catch {
      parseFailures += 1;
      findings.push({
        level: "error",
        code: "plugin_manifest_parse_failed",
        source: "codex-plugin-catalog",
        message: "A discovered plugin manifest could not be parsed safely.",
      });
    }
  }

  // The marketplace may advertise entries whose manifests are not materialized
  // in the local catalogue. Keep those records visible without pretending that
  // their implementation metadata is present.
  for (const record of marketplaceRecords || []) {
    if (manifestNames.has(record.name)) continue;
    const slug = slugify(record.name);
    artifacts.push(createArtifact({
      id: `plugin:${slug}`,
      type: "plugin",
      name: record.name,
      description: "Marketplace entry without a locally materialized plugin manifest.",
      source: "codex-plugin-marketplace-index",
      hosts: ["codex"],
      capabilities: inferCapabilities(record.name, record.category),
      classificationEvidence: "structural",
      lifecycle: {
        discovered: "yes",
        present: "no",
        installed: installedNames.has(record.name) ? "yes" : "no",
        enabled: "unknown",
        authenticated: "unknown",
        runnable: "unknown",
        verified: "unknown",
      },
      risk: { level: "unknown", reasons: ["plugin manifest is not locally materialized"] },
      metadata: {
        category: record.category,
        manifestCapabilityStatus: "manifest_missing",
        surfaces: {},
      },
    }));
  }

  return {
    artifacts,
    edges,
    findings,
    sources: [
      {
        id: "codex-plugin-manifests",
        status: "available",
        records: manifests.length,
        represented: manifests.length - parseFailures,
        deduplicated: 0,
        parseFailures,
        metadata: { unlabelledManifests: unlabelled, marketplaceRecords: marketplaceRecords?.length ?? null },
      },
      {
        id: "codex-plugin-marketplace-index",
        status: marketplaceRecords === null ? "absent" : "available",
        records: marketplaceRecords?.length || 0,
        represented: marketplaceRecords?.length || 0,
        deduplicated: 0,
        parseFailures: 0,
      },
      {
        id: "codex-plugin-bundled-skills",
        status: "available",
        records: skillRecords,
        represented: skillRepresented,
        deduplicated: 0,
        parseFailures: skillRecords - skillRepresented,
      },
      {
        id: "codex-plugin-declared-integrations",
        status: "available",
        records: integrationRecords,
        represented: integrationRecords,
        deduplicated: 0,
        parseFailures: 0,
      },
    ],
  };
}

function pluginSurfaces(manifest, directory) {
  const result = {};
  for (const name of ["skills", "apps", "mcpServers"]) {
    const value = manifest[name];
    if (Array.isArray(value)) result[name] = value.length;
    else if (value && typeof value === "object") result[name] = Object.keys(value).length;
    else if (typeof value === "string" && value) result[name] = 1;
  }
  for (const name of Object.keys(COMPONENT_DIRECTORIES)) {
    const count = walkFiles(path.join(directory, name)).length;
    if (count) result[name] = count;
  }
  return result;
}

function declarationEntries(value) {
  if (typeof value === "string" && value) return [{ shape: "string" }];
  if (Array.isArray(value)) return value.map(() => ({ shape: "array-entry" }));
  if (value && typeof value === "object") return Object.keys(value).map(() => ({ shape: "object-entry" }));
  return [];
}

function componentDisplayName(relative, type, providerName) {
  const extensionless = relative.slice(0, relative.length - path.extname(relative).length);
  const segments = extensionless.split("/");
  const base = segments.at(-1);
  const generic = new Set(["openai", "index", "config", "plugin", "main"]);
  const selected = generic.has(base.toLowerCase())
    ? segments.length > 1
      ? segments.at(-2)
      : `${providerName} ${type}`
    : base;
  return selected.replace(/[-_]+/g, " ");
}

function installedPluginNames(codexRoot) {
  const cacheRoot = path.join(codexRoot, "plugins", "cache");
  const result = new Set();
  if (!fs.existsSync(cacheRoot)) return result;
  for (const marketplace of fs.readdirSync(cacheRoot, { withFileTypes: true })) {
    if (!marketplace.isDirectory()) continue;
    for (const plugin of fs.readdirSync(path.join(cacheRoot, marketplace.name), { withFileTypes: true })) {
      if (plugin.isDirectory()) result.add(plugin.name);
    }
  }
  return result;
}

function marketplacePlugins(root, findings) {
  const file = path.join(root, ".agents", "plugins", "marketplace.json");
  if (!fs.existsSync(file)) return null;
  try {
    const data = readJson(file);
    if (!Array.isArray(data.plugins)) return null;
    return data.plugins.map((record, index) => ({
      name: safeText(typeof record === "string" ? record : record?.name, 120) || `unlabelled-marketplace-entry-${index + 1}`,
      category: safeText(typeof record === "object" ? record?.category : null, 80) || null,
    }));
  } catch {
    findings.push({
      level: "error",
      code: "marketplace_parse_failed",
      source: "codex-plugin-catalog",
      message: "The marketplace index could not be parsed safely.",
    });
    return null;
  }
}

function empty(id) {
  return {
    artifacts: [],
    edges: [],
    findings: [],
    sources: [{ id, status: "absent", records: 0, represented: 0, deduplicated: 0, parseFailures: 0 }],
  };
}
