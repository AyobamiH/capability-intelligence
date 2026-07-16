import fs from "node:fs";
import path from "node:path";
import { createArtifact, componentRisk } from "../model.js";
import { inferCapabilities } from "../classify.js";
import { parseSkillFile } from "./skills.js";
import { extractCapabilityLabels, readJson, safeText, slugify, stableHash, walkFiles } from "../utils.js";

const COMPONENT_DIRECTORIES = {
  agents: "agent",
  commands: "command",
  scripts: "helper-script",
  ui: "ui",
  workflows: "workflow",
  schemas: "schema",
};

export function scanInstalledPlugins(config) {
  const root = path.join(config.codexRoot, "plugins", "cache");
  if (!fs.existsSync(root)) return empty();
  const artifacts = [];
  const edges = [];
  const findings = [];
  let records = 0;
  let parseFailures = 0;

  for (const marketplaceEntry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!marketplaceEntry.isDirectory()) continue;
    const marketplaceRoot = path.join(root, marketplaceEntry.name);
    for (const pluginEntry of fs.readdirSync(marketplaceRoot, { withFileTypes: true })) {
      if (!pluginEntry.isDirectory()) continue;
      const pluginRoot = path.join(marketplaceRoot, pluginEntry.name);
      const versionDirectories = fs
        .readdirSync(pluginRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(pluginRoot, entry.name, ".codex-plugin", "plugin.json")))
        .map((entry) => entry.name)
        .sort();
      if (!versionDirectories.length) {
        records += 1;
        parseFailures += 1;
        findings.push({
          level: "error",
          code: "installed_plugin_manifest_missing",
          source: "codex-installed-plugin-cache",
          message: "An installed plugin record had no readable version manifest.",
        });
        continue;
      }
      for (const version of versionDirectories) {
        const versionRoot = path.join(pluginRoot, version);
        const manifestPath = path.join(versionRoot, ".codex-plugin", "plugin.json");
        records += 1;
        try {
          const manifest = readJson(manifestPath);
          const slug = slugify(manifest.name || pluginEntry.name);
          const installationId = `plugin-installation:${slug}:${slugify(version)}`;
          const declared = extractCapabilityLabels(manifest.interface?.capabilities);
          const inferred = inferCapabilities(
            manifest.name,
            manifest.description,
            manifest.interface?.displayName,
            manifest.interface?.shortDescription,
            ...(manifest.keywords || []),
          );
          artifacts.push(
            createArtifact({
              id: installationId,
              type: "plugin-installation",
              name: manifest.interface?.displayName || manifest.name || pluginEntry.name,
              description: manifest.interface?.shortDescription || manifest.description,
              source: "codex-installed-plugin-cache",
              hosts: ["codex"],
              capabilities: declared.length ? declared : inferred,
              classificationEvidence: declared.length ? "declared" : inferred.length ? "inferred" : "structural",
              lifecycle: {
                discovered: "yes",
                present: "yes",
                installed: "yes",
                enabled: "unknown",
                authenticated: "unknown",
                runnable: "unknown",
                verified: "unknown",
              },
              risk: { level: "medium", reasons: ["installed plugin may expose executable integration surfaces"] },
              metadata: {
                version: safeText(version, 80),
                marketplace: safeText(marketplaceEntry.name, 100),
                catalogueArtifact: `plugin:${slug}`,
              },
            }),
          );
          edges.push({ from: `plugin:${slug}`, to: installationId, type: "installed-as" });

          for (const file of walkFiles(versionRoot, (candidate) => path.basename(candidate) === "SKILL.md")) {
            records += 1;
            try {
              const relative = path.relative(versionRoot, file).split(path.sep).join("/");
              const skill = parseSkillFile(file, {
                sourceKey: `installed-${slug}-${slugify(version)}`,
                pathKey: slugify(relative),
                source: "codex-installed-plugin-cache",
                hosts: ["codex"],
                installed: true,
                relativeLocation: `installed-plugin:${slug}/${relative}`,
              });
              artifacts.push(skill);
              edges.push({ from: installationId, to: skill.id, type: "contains" });
            } catch {
              parseFailures += 1;
              findings.push({
                level: "error",
                code: "installed_plugin_skill_parse_failed",
                source: "codex-installed-plugin-cache",
                message: "An installed plugin skill could not be parsed safely.",
              });
            }
          }

          for (const [field, type, label] of [
            ["apps", "app-integration", "app integration"],
            ["mcpServers", "mcp-server", "MCP server"],
          ]) {
            const count = declarationCount(manifest[field]);
            for (let index = 0; index < count; index += 1) {
              records += 1;
              const id = `${type}:installed:${slug}:${slugify(version)}:${index + 1}`;
              artifacts.push(
                createArtifact({
                  id,
                  type,
                  name: `${manifest.interface?.displayName || manifest.name} ${label}`,
                  description: `Installed ${label} supplied by this plugin version.`,
                  source: "codex-installed-plugin-cache",
                  hosts: ["codex"],
                  capabilities: declared.length ? declared : inferred,
                  classificationEvidence: "structural",
                  lifecycle: {
                    discovered: "yes",
                    present: "yes",
                    installed: "yes",
                    enabled: "unknown",
                    authenticated: "unknown",
                    runnable: "unknown",
                    verified: "unknown",
                  },
                  risk: componentRisk(type),
                  metadata: { provider: installationId, declarationKind: field },
                }),
              );
              edges.push({ from: installationId, to: id, type: "provides" });
            }
          }

          for (const [directoryName, type] of Object.entries(COMPONENT_DIRECTORIES)) {
            const componentRoot = path.join(versionRoot, directoryName);
            for (const file of walkFiles(componentRoot)) {
              if (path.basename(file) === "SKILL.md") continue;
              records += 1;
              const relative = path.relative(componentRoot, file).split(path.sep).join("/");
              const id = `${type}:installed:${slug}:${slugify(version)}:${stableHash(relative)}`;
              artifacts.push(
                createArtifact({
                  id,
                  type,
                  name: componentName(relative, type, manifest.interface?.displayName || manifest.name),
                  description: `Installed ${type} supplied by ${manifest.interface?.displayName || manifest.name}.`,
                  source: "codex-installed-plugin-cache",
                  hosts: ["codex"],
                  capabilities: inferCapabilities(relative, manifest.description),
                  classificationEvidence: "structural",
                  lifecycle: {
                    discovered: "yes",
                    present: "yes",
                    installed: "yes",
                    enabled: "unknown",
                    authenticated: "unknown",
                    runnable: "unknown",
                    verified: "unknown",
                  },
                  risk: componentRisk(type),
                  metadata: { provider: installationId, relativeLocation: `${directoryName}/${relative}` },
                }),
              );
              edges.push({ from: installationId, to: id, type: "contains" });
            }
          }

          const hooksFile = path.join(versionRoot, "hooks.json");
          if (fs.existsSync(hooksFile)) {
            records += 1;
            const id = `hook:installed:${slug}:${slugify(version)}:lifecycle`;
            artifacts.push(
              createArtifact({
                id,
                type: "hook",
                name: `${manifest.interface?.displayName || manifest.name} lifecycle hooks`,
                description: "Installed plugin lifecycle hooks.",
                source: "codex-installed-plugin-cache",
                hosts: ["codex"],
                capabilities: inferred,
                classificationEvidence: "structural",
                lifecycle: {
                  discovered: "yes",
                  present: "yes",
                  installed: "yes",
                  enabled: "unknown",
                  authenticated: "unknown",
                  runnable: "unknown",
                  verified: "unknown",
                },
                risk: componentRisk("hook"),
                metadata: { provider: installationId },
              }),
            );
            edges.push({ from: installationId, to: id, type: "contains" });
          }
        } catch {
          parseFailures += 1;
          findings.push({
            level: "error",
            code: "installed_plugin_manifest_parse_failed",
            source: "codex-installed-plugin-cache",
            message: "An installed plugin version manifest could not be parsed safely.",
          });
        }
      }
    }
  }

  return {
    artifacts,
    edges,
    findings,
    sources: [{
      id: "codex-installed-plugin-cache",
      status: "available",
      records,
      represented: artifacts.length,
      deduplicated: 0,
      parseFailures,
    }],
  };
}

function declarationCount(value) {
  if (typeof value === "string" && value) return 1;
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === "object") return Object.keys(value).length;
  return 0;
}

function componentName(relative, type, providerName) {
  const base = path.basename(relative, path.extname(relative));
  if (["openai", "index", "main"].includes(base.toLowerCase())) {
    const parent = path.basename(path.dirname(relative));
    return parent === "."
      ? `${providerName} ${type}`
      : parent.replace(/[-_]+/g, " ");
  }
  return base.replace(/[-_]+/g, " ");
}

function empty() {
  return {
    artifacts: [],
    edges: [],
    findings: [],
    sources: [{ id: "codex-installed-plugin-cache", status: "absent", records: 0, represented: 0, deduplicated: 0, parseFailures: 0 }],
  };
}
