import { outcomeTokens } from "./classify.js";
import { searchArtifacts } from "./query.js";

const GENERIC_TERMS = new Set([
  "agent", "agents", "capability", "capabilities", "help", "need", "needs",
  "tool", "tools", "use", "using", "workflow", "workflows",
]);

const TYPE_WEIGHT = Object.freeze({
  "workflow-route": 5,
  skill: 4,
  "helper-script": 3,
  command: 3,
  "app-tool": 2,
  plugin: 1,
  connector: 1,
  schema: -4,
  template: -4,
  "documentation-control": -5,
});

const AUTHORITY_WEIGHT = Object.freeze({
  read_only: 3,
  unknown: 0,
  write: -5,
  destructive: -12,
});

export function recommendCapability(inventory, outcome, options = {}) {
  const requestedOutcome = String(outcome || "").trim();
  const terms = outcomeTokens(requestedOutcome);
  const meaningfulTerms = terms.filter((term) => !GENERIC_TERMS.has(term));
  const boundary = [
    "No capability was installed, enabled, authenticated, or invoked.",
    "Execution requires a separate authority decision outside this recommendation.",
  ];

  if (!requestedOutcome || !meaningfulTerms.length) {
    return {
      outcome: requestedOutcome,
      status: "outcome_too_broad",
      automaticAction: false,
      recommendation: null,
      alternatives: [],
      deferred: [],
      nextSafeStep: "Describe a concrete task and target, such as: review a GitHub pull request.",
      boundary,
    };
  }

  const candidates = searchArtifacts(inventory, requestedOutcome, options.searchLimit || 100)
    .map((record) => candidateRecord(record, meaningfulTerms))
    .filter((record) => record.matchedMeaningfulTerms.length)
    .sort(compareCandidates);
  const unique = uniqueCandidates(candidates);
  const selectable = unique.filter((candidate) => !["write", "destructive"].includes(candidate.authority));
  const recommendation = selectable[0] || unique[0] || null;

  if (!recommendation) {
    return {
      outcome: requestedOutcome,
      status: "no_candidate",
      automaticAction: false,
      recommendation: null,
      alternatives: [],
      deferred: [],
      nextSafeStep: "Inspect source coverage, then add or discover a capability under a separate objective.",
      boundary,
    };
  }

  const alternatives = selectable
    .filter((candidate) => candidate.artifact.id !== recommendation.artifact.id)
    .slice(0, options.alternativeLimit || 4);
  const deferred = unique
    .filter((candidate) => ["write", "destructive"].includes(candidate.authority))
    .slice(0, options.deferredLimit || 5)
    .map((candidate) => ({
      id: candidate.artifact.id,
      name: candidate.artifact.name,
      authority: candidate.authority,
      reason: `${candidate.authority} authority is not selected automatically`,
    }));

  return {
    outcome: requestedOutcome,
    status: "candidate_found",
    confidence: confidence(recommendation, meaningfulTerms),
    automaticAction: false,
    recommendation,
    alternatives,
    deferred,
    nextSafeStep: nextSafeStep(recommendation),
    boundary,
  };
}

export function authorityClass(artifact) {
  const annotations = artifact.metadata?.annotations || {};
  const reasons = artifact.risk?.reasons || [];
  const permission = String(artifact.metadata?.permissionLevel || "").toLowerCase();

  if (annotations.destructiveHint === true || reasons.includes("destructive tool")) return "destructive";
  if (annotations.openWorldHint === true && annotations.readOnlyHint !== true) return "write";
  if (reasons.includes("open-world write capability")) return "write";
  if (annotations.readOnlyHint === true || reasons.includes("declared read-only")) return "read_only";
  if (permission && /(^|[, ]+)([^, ]*-read|read-only)([, ]+|$)/.test(permission)
    && !/(write|publish|deploy|mutation|admin|delete|merge)/.test(permission)) return "read_only";
  if (/(write|publish|deploy|mutation|admin|delete|merge)/.test(permission)) return "write";
  return "unknown";
}

function candidateRecord({ artifact, score, matched }, meaningfulTerms) {
  const authority = authorityClass(artifact);
  const blockers = readinessBlockers(artifact.lifecycle);
  const matchedMeaningfulTerms = meaningfulTerms.filter((term) => matched.includes(term));
  return {
    artifact: recommendationArtifact(artifact),
    queryScore: score,
    recommendationScore: score
      + (TYPE_WEIGHT[artifact.type] || 0)
      + readinessWeight(artifact.lifecycle)
      + AUTHORITY_WEIGHT[authority],
    matched,
    matchedMeaningfulTerms,
    authority,
    readiness: readinessState(artifact.lifecycle),
    blockers,
  };
}

function recommendationArtifact(artifact) {
  return {
    id: artifact.id,
    name: artifact.name,
    type: artifact.type,
    source: artifact.source,
    description: artifact.description,
    capabilities: artifact.capabilities,
    lifecycle: artifact.lifecycle,
    risk: artifact.risk,
  };
}

function readinessWeight(lifecycle) {
  if (lifecycle.verified === "yes") return 10;
  if (lifecycle.runnable === "yes") return 7;
  if (lifecycle.authenticated === "yes") return 5;
  if (lifecycle.enabled === "yes") return 4;
  if (lifecycle.installed === "yes") return 3;
  if (lifecycle.present === "yes") return 1;
  return 0;
}

function readinessState(lifecycle) {
  for (const state of ["verified", "runnable", "authenticated", "enabled", "installed", "present", "discovered"]) {
    if (lifecycle[state] === "yes") return state;
  }
  return "unknown";
}

function readinessBlockers(lifecycle) {
  const blockers = [];
  for (const state of ["installed", "enabled", "authenticated", "runnable", "verified"]) {
    if (lifecycle[state] === "unknown") blockers.push(`${state} is not proven`);
    else if (lifecycle[state] === "no") blockers.push(`${state} is known not ready`);
  }
  return blockers;
}

function confidence(candidate, meaningfulTerms) {
  const coverage = candidate.matchedMeaningfulTerms.length / meaningfulTerms.length;
  if (candidate.matchedMeaningfulTerms.length >= 2 && coverage >= 0.5) return "high";
  if (candidate.matchedMeaningfulTerms.length >= 2 || coverage >= 0.5) return "medium";
  return "low";
}

function nextSafeStep(candidate) {
  if (["write", "destructive"].includes(candidate.authority)) {
    return "No lower-authority candidate was found. Inspect this candidate and obtain explicit authority before any use.";
  }
  if (candidate.blockers.length) {
    return `Inspect the candidate, then prove its readiness gates: ${candidate.blockers.join("; ")}.`;
  }
  return "Inspect the candidate evidence, then invoke it only under a separate explicit authority decision.";
}

function uniqueCandidates(candidates) {
  const seen = new Set();
  return candidates.filter((candidate) => {
    const key = `${candidate.artifact.type}:${candidate.artifact.name.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function compareCandidates(left, right) {
  return right.recommendationScore - left.recommendationScore
    || right.queryScore - left.queryScore
    || left.artifact.name.localeCompare(right.artifact.name)
    || left.artifact.id.localeCompare(right.artifact.id);
}
