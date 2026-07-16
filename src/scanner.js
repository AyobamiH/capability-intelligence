import os from "node:os";
import path from "node:path";
import { scanPluginCatalog } from "./adapters/plugin-catalog.js";
import { scanSkillRoots } from "./adapters/skills.js";
import { scanAppTools } from "./adapters/app-tools.js";
import { scanConnectors } from "./adapters/connectors.js";
import { scanWorkflowLibrary } from "./adapters/workflow-library.js";
import { scanInstalledPlugins } from "./adapters/installed-plugins.js";
import { buildGraph } from "./graph.js";
import { stableSort, toIso } from "./utils.js";

const ADAPTERS = [
  scanPluginCatalog,
  scanInstalledPlugins,
  scanSkillRoots,
  scanAppTools,
  scanConnectors,
  scanWorkflowLibrary,
];
const FORBIDDEN_KEYS = /^(authorization|authorizationHeader|connectorId|serverOrigin|installUrl|apiKey|secretValue|token|rawPayload)$/i;
const UNSAFE_VALUE_PATTERNS = [
  /\/home\/[A-Za-z0-9._-]+\//,
  /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
  /\bBearer\s+[A-Za-z0-9._~+/-]{24,}=*/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
];

export function defaultConfig(home = os.homedir()) {
  const codexRoot = path.join(home, ".codex");
  return {
    home,
    codexRoot,
    workflowLibraryRoot: path.join(home, ".openclaw", "skills", "coding-workflow-library"),
    skillRoots: [
      { id: "codex-user-skills", label: "codex-skills", path: path.join(codexRoot, "skills"), hosts: ["codex"] },
      { id: "shared-agent-skills", label: "agent-skills", path: path.join(home, ".agents", "skills"), hosts: ["codex", "claude", "openclaw"] },
      { id: "claude-skills", label: "claude-skills", path: path.join(home, ".claude", "skills"), hosts: ["claude"] },
    ],
  };
}

export function scanEnvironment(options = {}) {
  const config = options.config || defaultConfig(options.home);
  const results = ADAPTERS.map((adapter) => {
    try {
      return adapter(config);
    } catch {
      return {
        artifacts: [],
        edges: [],
        findings: [{
          level: "error",
          code: "adapter_failed",
          source: adapter.name,
          message: "A source adapter failed without exposing source content.",
        }],
        sources: [{
          id: adapter.name,
          status: "failed",
          records: 0,
          represented: 0,
          deduplicated: 0,
          parseFailures: 1,
        }],
      };
    }
  });

  const findings = results.flatMap((result) => result.findings || []);
  const artifacts = [];
  const artifactIds = new Set();
  for (const artifact of results.flatMap((result) => result.artifacts || [])) {
    if (artifactIds.has(artifact.id)) {
      findings.push({
        level: "error",
        code: "duplicate_artifact_id",
        source: artifact.source,
        message: `Duplicate artifact identity was rejected: ${artifact.id}`,
      });
      continue;
    }
    artifactIds.add(artifact.id);
    artifacts.push(artifact);
  }
  const sortedArtifacts = stableSort(artifacts, (artifact) => artifact.id);
  const graph = buildGraph(sortedArtifacts, results.flatMap((result) => result.edges || []));
  const sources = stableSort(results.flatMap((result) => result.sources || []), (source) => source.id);
  const inventory = {
    schemaVersion: "1.0",
    generatedAt: toIso(options.clock),
    mode: "local-read-only",
    summary: buildSummary(sortedArtifacts, sources),
    sources,
    artifacts: sortedArtifacts,
    graph,
    findings: stableSort(findings, (finding) => `${finding.level}:${finding.code}:${finding.source}`),
  };
  inventory.coverage = evaluateCoverage(inventory);
  return inventory;
}

export function evaluateCoverage(inventory) {
  const failures = [];
  for (const source of inventory.sources) {
    if (source.status === "failed") failures.push(`${source.id}: adapter failed`);
    if (source.parseFailures > 0) failures.push(`${source.id}: ${source.parseFailures} parse failure(s)`);
    if (source.status === "available") {
      const accounted = source.represented + source.deduplicated + source.parseFailures;
      if (source.records !== accounted) {
        failures.push(`${source.id}: ${source.records - accounted} record(s) unaccounted for`);
      }
    }
  }
  for (const finding of inventory.findings) {
    if (finding.level === "error") failures.push(`${finding.source}: ${finding.code}`);
  }
  const unsafe = findUnsafeOutput(inventory);
  failures.push(...unsafe);
  const manifestSource = inventory.sources.find((source) => source.id === "codex-plugin-manifests");
  const unlabelledArtifacts = inventory.artifacts.filter(
    (artifact) => artifact.type === "plugin" && artifact.metadata.manifestCapabilityStatus === "unlabelled",
  ).length;
  const expectedUnlabelled = manifestSource?.metadata?.unlabelledManifests;
  if (expectedUnlabelled !== undefined && expectedUnlabelled !== unlabelledArtifacts) {
    failures.push("codex-plugin-manifests: unlabelled manifest coverage mismatch");
  }
  return {
    status: failures.length ? "failed" : "passed",
    failures: [...new Set(failures)].sort(),
    unlabelledManifests: unlabelledArtifacts,
    sourceCount: inventory.sources.length,
    artifactCount: inventory.artifacts.length,
  };
}

export function redactedInventory(inventory) {
  const copy = structuredClone(inventory);
  copy.exportMode = "redacted";
  for (const artifact of copy.artifacts) {
    if (!["codex-plugin-catalog", "coding-workflow-library"].includes(artifact.source)) {
      artifact.description = artifact.description ? "Description withheld in redacted export." : "";
    }
    delete artifact.metadata.relativeLocation;
    delete artifact.metadata.connectorName;
  }
  copy.coverage = evaluateCoverage(copy);
  return copy;
}

export function findUnsafeOutput(value, pathLabel = "inventory") {
  const failures = [];
  visit(value, pathLabel);
  return failures;

  function visit(item, currentPath) {
    if (Array.isArray(item)) {
      item.forEach((entry, index) => visit(entry, `${currentPath}[${index}]`));
      return;
    }
    if (item && typeof item === "object") {
      for (const [key, entry] of Object.entries(item)) {
        if (FORBIDDEN_KEYS.test(key)) failures.push(`${currentPath}.${key}: forbidden output field`);
        visit(entry, `${currentPath}.${key}`);
      }
      return;
    }
    if (typeof item === "string" && UNSAFE_VALUE_PATTERNS.some((pattern) => pattern.test(item))) {
      failures.push(`${currentPath}: unsafe value pattern`);
    }
  }
}

function buildSummary(artifacts, sources) {
  const byType = {};
  const byRisk = {};
  const byLifecycle = {};
  for (const artifact of artifacts) {
    byType[artifact.type] = (byType[artifact.type] || 0) + 1;
    byRisk[artifact.risk.level] = (byRisk[artifact.risk.level] || 0) + 1;
    for (const [state, value] of Object.entries(artifact.lifecycle)) {
      if (value === "yes") byLifecycle[state] = (byLifecycle[state] || 0) + 1;
    }
  }
  return {
    artifacts: artifacts.length,
    sourcesAvailable: sources.filter((source) => source.status === "available").length,
    sourcesAbsent: sources.filter((source) => source.status === "absent").length,
    byType: sortObject(byType),
    byRisk: sortObject(byRisk),
    lifecycleYes: sortObject(byLifecycle),
  };
}

function sortObject(object) {
  return Object.fromEntries(Object.entries(object).sort(([left], [right]) => left.localeCompare(right)));
}
