export function buildGraph(artifacts, suppliedEdges = []) {
  const edges = [...suppliedEdges];
  const skillGroups = new Map();
  for (const artifact of artifacts) {
    if (artifact.type !== "skill") continue;
    const key = artifact.name.toLowerCase();
    const group = skillGroups.get(key) || [];
    group.push(artifact);
    skillGroups.set(key, group);
  }
  const duplicates = [];
  for (const [name, group] of skillGroups) {
    if (group.length < 2) continue;
    duplicates.push({ name, artifactIds: group.map((artifact) => artifact.id).sort() });
    const [first, ...rest] = group;
    for (const artifact of rest) edges.push({ from: first.id, to: artifact.id, type: "duplicates" });
  }
  return {
    edges: edges.sort((left, right) =>
      `${left.from}:${left.type}:${left.to}`.localeCompare(`${right.from}:${right.type}:${right.to}`),
    ),
    duplicates: duplicates.sort((left, right) => left.name.localeCompare(right.name)),
  };
}
