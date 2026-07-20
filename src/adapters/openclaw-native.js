import fs from "node:fs";
import path from "node:path";
import { inferCapabilities } from "../classify.js";
import { componentRisk, createArtifact } from "../model.js";
import { pathExists, readJson, safeName, safeText, stableSort, unique } from "../utils.js";

export function scanOpenClawNativePlugins(config) {
  const artifacts = [];
  const findings = [];
  const sources = [];

  for (const root of config.openclawPluginRoots || []) {
    if (!pathExists(root.path)) {
      sources.push(sourceRecord(root.id, "absent"));
      continue;
    }

    const manifests = discoverManifests(root);
    let represented = 0;
    let parseFailures = 0;
    for (const manifestPath of manifests) {
      try {
        const manifest = readJson(manifestPath);
        const id = safeText(manifest.id || path.basename(path.dirname(manifestPath)), 120);
        if (!id) throw new Error("missing plugin id");
        artifacts.push(toArtifact({ manifest, id, root }));
        represented += 1;
      } catch {
        parseFailures += 1;
        findings.push({
          level: "error",
          code: "openclaw_plugin_manifest_parse_failed",
          source: root.id,
          message: "An OpenClaw plugin manifest could not be represented without exposing its contents.",
        });
      }
    }
    sources.push({
      ...sourceRecord(root.id, "available"),
      records: manifests.length,
      represented,
      parseFailures,
    });
  }

  return { artifacts, findings, sources, edges: [] };
}

function discoverManifests(root) {
  if (root.layout === "managed-npm") return discoverManagedNpmManifests(root.path);
  return stableSort(fs.readdirSync(root.path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root.path, entry.name, "openclaw.plugin.json"))
    .filter(pathExists));
}

function discoverManagedNpmManifests(root) {
  const manifests = [];
  for (const project of fs.readdirSync(root, { withFileTypes: true })) {
    if (!project.isDirectory()) continue;
    const scope = path.join(root, project.name, "node_modules", "@openclaw");
    if (!pathExists(scope)) continue;
    for (const packageEntry of fs.readdirSync(scope, { withFileTypes: true })) {
      if (!packageEntry.isDirectory()) continue;
      const manifest = path.join(scope, packageEntry.name, "openclaw.plugin.json");
      if (pathExists(manifest)) manifests.push(manifest);
    }
  }
  return stableSort(manifests);
}

function toArtifact({ manifest, id, root }) {
  const surfaces = surfaceCounts(manifest);
  const description = safeText(manifest.description || `${safeName(manifest.name || id)} OpenClaw plugin.`);
  const capabilities = unique([
    ...inferCapabilities(id, manifest.name, description, Object.keys(surfaces).join(" ")),
    ...surfaceLabels(surfaces),
  ]);
  const installed = ["local-extension", "managed-npm"].includes(root.kind) ? "yes" : "unknown";
  return createArtifact({
    id: `openclaw-plugin:${root.id}:${id}`,
    type: "plugin",
    name: manifest.name || id,
    description,
    source: "openclaw-native-plugins",
    hosts: ["openclaw"],
    capabilities,
    classificationEvidence: capabilities.length ? "inferred" : "structural",
    lifecycle: { discovered: "yes", present: "yes", installed },
    risk: componentRisk("app-integration"),
    metadata: {
      manifestId: id,
      origin: root.kind,
      enabledByDefault: manifest.enabledByDefault === true,
      activationOnStartup: manifest.activation?.onStartup === true,
      surfaces,
    },
  });
}

function surfaceCounts(manifest) {
  const definitions = {
    providers: manifest.providers,
    channels: manifest.channels,
    skills: manifest.skills,
    commands: manifest.commandAliases,
    tools: manifest.toolMetadata,
    cliBackends: manifest.cliBackends,
  };
  return Object.fromEntries(Object.entries(definitions)
    .map(([name, value]) => [name, Array.isArray(value) ? value.length : value && typeof value === "object" ? Object.keys(value).length : 0])
    .filter(([, count]) => count > 0));
}

function surfaceLabels(surfaces) {
  const labels = [];
  if (surfaces.providers) labels.push("model provider");
  if (surfaces.channels) labels.push("communication");
  if (surfaces.skills) labels.push("workflow");
  if (surfaces.commands || surfaces.cliBackends) labels.push("command");
  if (surfaces.tools) labels.push("tooling");
  return labels;
}

function sourceRecord(id, status) {
  return { id, status, records: 0, represented: 0, deduplicated: 0, parseFailures: 0 };
}
