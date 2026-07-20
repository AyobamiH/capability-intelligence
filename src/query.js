import { matchOutcome } from "./classify.js";

export function searchArtifacts(inventory, query, limit = 20) {
  return inventory.artifacts
    .map((artifact) => ({ artifact, ...matchOutcome(artifact, query) }))
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.artifact.name.localeCompare(right.artifact.name))
    .slice(0, limit);
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
