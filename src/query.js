import { matchOutcome } from "./classify.js";

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 200;

export function searchArtifacts(inventory, query, limit = 20) {
  const value = String(query || "").trim();
  if (!value) return [];
  return queryArtifactPage(inventory, { query: value, limit }).items;
}

export function queryArtifactPage(inventory, options = {}) {
  const query = String(options.query || "").trim();
  const type = String(options.type || "").trim();
  const risk = String(options.risk || "").trim();
  const offset = boundedInteger(options.offset, 0, Number.MAX_SAFE_INTEGER, 0);
  const limit = boundedInteger(options.limit, 1, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE);
  const records = rankedArtifactMatches(inventory, { query, type, risk });

  return {
    query,
    type: type || null,
    risk: risk || null,
    offset,
    limit,
    total: records.length,
    hasPrevious: offset > 0,
    hasNext: offset + limit < records.length,
    items: records.slice(offset, offset + limit),
  };
}

// Recommendation policy needs the complete relevant set. Pagination remains a
// presentation concern and must not hide a lower-scoring but better-fit tool.
export function rankedArtifactMatches(inventory, options = {}) {
  const query = String(options.query || "").trim();
  const type = String(options.type || "").trim();
  const risk = String(options.risk || "").trim();
  let records = inventory.artifacts
    .filter((artifact) => !type || artifact.type === type)
    .filter((artifact) => !risk || artifact.risk.level === risk)
    .map((artifact) => ({ artifact, ...(query ? matchOutcome(artifact, query) : { score: 0, matched: [] }) }));

  if (query) records = records.filter((record) => record.score > 0);
  records.sort((left, right) => query
    ? right.score - left.score || compareArtifacts(left.artifact, right.artifact)
    : compareArtifacts(left.artifact, right.artifact));

  return records;
}

export function inspectArtifact(inventory, id) {
  const artifact = inventory.artifacts.find((candidate) => candidate.id === id);
  if (!artifact) return null;
  return {
    artifact,
    incoming: inventory.graph.edges.filter((edge) => edge.to === id),
    outgoing: inventory.graph.edges.filter((edge) => edge.from === id),
  };
}

export function hostDiff(inventory, leftHost, rightHost) {
  const byName = new Map();
  for (const artifact of inventory.artifacts) {
    if (!artifact.hosts.includes(leftHost) && !artifact.hosts.includes(rightHost)) continue;
    const key = `${artifact.type}:${artifact.name.toLowerCase()}`;
    const record = byName.get(key) || { type: artifact.type, name: artifact.name, left: false, right: false };
    if (artifact.hosts.includes(leftHost)) record.left = true;
    if (artifact.hosts.includes(rightHost)) record.right = true;
    byName.set(key, record);
  }
  return [...byName.values()]
    .filter((record) => record.left !== record.right)
    .sort((left, right) => `${left.type}:${left.name}`.localeCompare(`${right.type}:${right.name}`));
}

export function inventoryHosts(inventory) {
  return [...new Set(inventory.artifacts.flatMap((artifact) => artifact.hosts))].sort();
}

export function unlabelledPluginReport(inventory) {
  const records = inventory.artifacts
    .filter((artifact) => artifact.type === "plugin"
      && artifact.source === "codex-plugin-catalog"
      && artifact.metadata?.manifestCapabilityStatus === "unlabelled")
    .map((artifact) => ({
      id: artifact.id,
      name: artifact.name,
      description: artifact.description,
      manifestCategory: artifact.metadata.category || null,
      broadCapabilities: artifact.capabilities,
      classificationEvidence: artifact.classificationEvidence,
      surfaces: artifact.metadata.surfaces || {},
      risk: artifact.risk,
      lifecycle: artifact.lifecycle,
    }))
    .sort((left, right) => {
      const category = (left.manifestCategory || "").localeCompare(right.manifestCategory || "");
      return category || left.name.localeCompare(right.name);
    });

  return {
    generatedAt: inventory.generatedAt,
    count: records.length,
    inferredCount: records.filter((record) => record.classificationEvidence === "inferred").length,
    structuralCount: records.filter((record) => record.classificationEvidence === "structural").length,
    records,
  };
}

function boundedInteger(value, minimum, maximum, fallback) {
  const number = Number(value);
  if (!Number.isInteger(number)) return fallback;
  return Math.min(maximum, Math.max(minimum, number));
}

function compareArtifacts(left, right) {
  return left.name.localeCompare(right.name) || left.id.localeCompare(right.id);
}
