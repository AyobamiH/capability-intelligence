import { safeName, safeText, unique } from "./utils.js";

export const LIFECYCLE_STATES = [
  "discovered",
  "present",
  "installed",
  "enabled",
  "authenticated",
  "runnable",
  "verified",
];

export const EVIDENCE_LEVELS = ["declared", "structural", "inferred", "observed", "unknown"];

export function lifecycle(overrides = {}) {
  return Object.fromEntries(LIFECYCLE_STATES.map((state) => [state, overrides[state] || "unknown"]));
}

export function createArtifact(input) {
  return {
    id: input.id,
    type: input.type,
    name: safeName(input.name),
    description: safeText(input.description),
    source: input.source,
    hosts: unique(input.hosts || []),
    capabilities: unique(input.capabilities || []),
    classificationEvidence: input.classificationEvidence || "unknown",
    lifecycle: lifecycle(input.lifecycle),
    risk: normaliseRisk(input.risk),
    metadata: input.metadata || {},
  };
}

export function normaliseRisk(input = {}) {
  const level = ["low", "medium", "high", "critical", "unknown"].includes(input.level)
    ? input.level
    : "unknown";
  return {
    level,
    reasons: unique(input.reasons || []),
  };
}

export function toolRisk(annotations = {}) {
  const readOnly = annotations.readOnlyHint === true;
  const destructive = annotations.destructiveHint === true;
  const openWorld = annotations.openWorldHint === true;
  if (destructive && openWorld) {
    return { level: "critical", reasons: ["destructive tool", "open-world effect"] };
  }
  if (destructive) return { level: "high", reasons: ["destructive tool"] };
  if (openWorld && !readOnly) return { level: "high", reasons: ["open-world write capability"] };
  if (!readOnly) return { level: "medium", reasons: ["write capability not excluded"] };
  return { level: "low", reasons: ["declared read-only"] };
}

export function componentRisk(type) {
  if (type === "hook") return { level: "high", reasons: ["automatic lifecycle hook"] };
  if (["app-integration", "mcp-server", "helper-script", "command"].includes(type)) {
    return { level: "medium", reasons: ["executable local or remote integration"] };
  }
  return { level: "low", reasons: [] };
}
