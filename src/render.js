export function renderSummary(inventory) {
  const lines = [
    "Capability Intelligence",
    `Coverage: ${inventory.coverage.status.toUpperCase()}`,
    `Artifacts: ${inventory.summary.artifacts}`,
    `Sources: ${inventory.summary.sourcesAvailable} available, ${inventory.summary.sourcesAbsent} absent`,
    `Unlabelled plugin manifests retained: ${inventory.coverage.unlabelledManifests}`,
    "",
    "Artifact types",
  ];
  for (const [type, count] of Object.entries(inventory.summary.byType)) lines.push(`  ${type}: ${count}`);
  lines.push("", "Risk");
  for (const [risk, count] of Object.entries(inventory.summary.byRisk)) lines.push(`  ${risk}: ${count}`);
  if (inventory.coverage.failures.length) {
    lines.push("", "Coverage failures");
    for (const failure of inventory.coverage.failures) lines.push(`  - ${failure}`);
  }
  return lines.join("\n");
}

export function renderInventory(inventory) {
  const lines = [renderSummary(inventory), "", "Capabilities"];
  for (const artifact of inventory.artifacts) {
    const state = readinessLabel(artifact.lifecycle);
    lines.push(
      `${artifact.id}\n  ${artifact.name} [${artifact.type}] | ${state} | risk=${artifact.risk.level}`,
    );
  }
  return lines.join("\n");
}

export function renderSearch(results, query) {
  if (!results.length) return `No capability matches found for: ${query}`;
  const lines = [`Capability matches for: ${query}`];
  for (const { artifact, score, matched } of results) {
    lines.push(
      `${artifact.id}\n  ${artifact.name} | score=${score} | ${readinessLabel(artifact.lifecycle)} | risk=${artifact.risk.level}\n  matched: ${matched.join(", ")}`,
    );
  }
  return lines.join("\n");
}

export function renderUnlabelledPlugins(report) {
  const lines = [
    `Unlabelled plugin manifests: ${report.count}`,
    `At least one broad label inferred: ${report.inferredCount}`,
    `Purpose retained through category and description only: ${report.structuralCount}`,
  ];
  for (const record of report.records) {
    const surfaces = Object.entries(record.surfaces)
      .map(([name, count]) => `${name}=${count}`)
      .join(", ") || "none";
    lines.push(
      "",
      `${record.name} (${record.id})`,
      `  Category: ${record.manifestCategory || "uncategorised"}`,
      `  Broad capabilities: ${record.broadCapabilities.join(", ") || "not inferred"}`,
      `  Evidence: ${record.classificationEvidence}`,
      `  Surfaces: ${surfaces}`,
      `  Lifecycle: installed=${record.lifecycle.installed}; verified=${record.lifecycle.verified}`,
      `  Description: ${record.description}`,
    );
  }
  return lines.join("\n");
}

export function readinessLabel(lifecycle) {
  const states = ["verified", "runnable", "authenticated", "enabled", "installed", "present", "discovered"];
  for (const state of states) if (lifecycle[state] === "yes") return state;
  return "unknown";
}
