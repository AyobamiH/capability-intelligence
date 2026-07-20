import { EVIDENCE_LEVELS, LIFECYCLE_STATES, RISK_LEVELS } from "./model.js";

const LIFECYCLE_VALUES = new Set(["yes", "no", "unknown", "not_applicable"]);
const SOURCE_STATES = new Set(["available", "absent", "failed"]);

export function validateInventoryShape(inventory) {
  const failures = [];
  requireValue(inventory, "schemaVersion", "1.0", failures);
  requireValue(inventory, "mode", "local-read-only", failures);
  if (!isIsoDate(inventory?.generatedAt)) failures.push("generatedAt must be an ISO date-time");
  if (!isObject(inventory?.summary)) failures.push("summary must be an object");
  validateSources(inventory?.sources, failures);
  validateArtifacts(inventory?.artifacts, failures);
  validateGraph(inventory?.graph, failures);
  validateFindings(inventory?.findings, failures);
  validateCoverage(inventory?.coverage, failures);
  return failures;
}

function validateSources(sources, failures) {
  if (!Array.isArray(sources)) return failures.push("sources must be an array");
  sources.forEach((source, index) => {
    const at = `sources[${index}]`;
    if (!isNonEmpty(source?.id)) failures.push(`${at}.id must be a non-empty string`);
    if (!SOURCE_STATES.has(source?.status)) failures.push(`${at}.status is invalid`);
    for (const key of ["records", "represented", "deduplicated", "parseFailures"]) {
      if (!isCount(source?.[key])) failures.push(`${at}.${key} must be a non-negative integer`);
    }
  });
}

function validateArtifacts(artifacts, failures) {
  if (!Array.isArray(artifacts)) return failures.push("artifacts must be an array");
  const ids = new Set();
  artifacts.forEach((artifact, index) => {
    const at = `artifacts[${index}]`;
    for (const key of ["id", "type", "name", "source"]) {
      if (!isNonEmpty(artifact?.[key])) failures.push(`${at}.${key} must be a non-empty string`);
    }
    if (ids.has(artifact?.id)) failures.push(`${at}.id must be unique`);
    ids.add(artifact?.id);
    if (!Array.isArray(artifact?.hosts) || artifact.hosts.some((value) => !isNonEmpty(value))) failures.push(`${at}.hosts must contain strings`);
    if (!Array.isArray(artifact?.capabilities) || artifact.capabilities.some((value) => !isNonEmpty(value))) failures.push(`${at}.capabilities must contain strings`);
    if (!EVIDENCE_LEVELS.includes(artifact?.classificationEvidence)) failures.push(`${at}.classificationEvidence is invalid`);
    if (!isObject(artifact?.metadata)) failures.push(`${at}.metadata must be an object`);
    if (!isObject(artifact?.lifecycle)) failures.push(`${at}.lifecycle must be an object`);
    for (const state of LIFECYCLE_STATES) {
      if (!LIFECYCLE_VALUES.has(artifact?.lifecycle?.[state])) failures.push(`${at}.lifecycle.${state} is invalid`);
    }
    if (!RISK_LEVELS.includes(artifact?.risk?.level)) failures.push(`${at}.risk.level is invalid`);
    if (!Array.isArray(artifact?.risk?.reasons) || artifact.risk.reasons.some((value) => !isNonEmpty(value))) failures.push(`${at}.risk.reasons must contain strings`);
  });
}

function validateGraph(graph, failures) {
  if (!isObject(graph)) return failures.push("graph must be an object");
  if (!Array.isArray(graph.edges)) failures.push("graph.edges must be an array");
  if (!Array.isArray(graph.duplicates)) failures.push("graph.duplicates must be an array");
}

function validateFindings(findings, failures) {
  if (!Array.isArray(findings)) return failures.push("findings must be an array");
  findings.forEach((finding, index) => {
    if (!isNonEmpty(finding?.level) || !isNonEmpty(finding?.code) || !isNonEmpty(finding?.source)) {
      failures.push(`findings[${index}] requires level, code, and source`);
    }
  });
}

function validateCoverage(coverage, failures) {
  if (!isObject(coverage)) return failures.push("coverage must be an object");
  if (!new Set(["passed", "failed"]).has(coverage.status)) failures.push("coverage.status is invalid");
  if (!Array.isArray(coverage.failures)) failures.push("coverage.failures must be an array");
  for (const key of ["unlabelledManifests", "sourceCount", "artifactCount"]) {
    if (!isCount(coverage[key])) failures.push(`coverage.${key} must be a non-negative integer`);
  }
}

function requireValue(object, key, expected, failures) {
  if (object?.[key] !== expected) failures.push(`${key} must equal ${expected}`);
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isCount(value) {
  return Number.isInteger(value) && value >= 0;
}

function isIsoDate(value) {
  return typeof value === "string" && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}
