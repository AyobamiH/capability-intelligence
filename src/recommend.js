import { rankedArtifactMatches } from "./query.js";
import { authorityAlignment, authorityClass, candidatePolicy, outcomeIntent } from "./recommend-policy.js";

export { authorityClass } from "./recommend-policy.js";

export function recommendCapability(inventory, outcome, options = {}) {
  const requestedOutcome = String(outcome || "").trim();
  const intent = outcomeIntent(requestedOutcome);
  const boundary = [
    "No capability was installed, enabled, authenticated, or invoked.",
    "Execution requires a separate authority decision outside this recommendation.",
  ];

  if (!requestedOutcome || !intent.rawTerms.length) {
    return {
      outcome: requestedOutcome,
      status: "outcome_too_broad",
      requiredAuthority: intent.requiredAuthority,
      automaticAction: false,
      recommendation: null,
      alternatives: [],
      deferred: [],
      nextSafeStep: "Describe a concrete task and target, such as: review a GitHub pull request.",
      boundary,
    };
  }

  const recommendationQuery = [requestedOutcome, ...intent.rawTerms, ...intent.conceptTerms].join(" ");
  const candidates = rankedArtifactMatches(inventory, { query: recommendationQuery })
    .map((record) => candidateRecord(record, intent))
    .filter((record) => record.matchEvidence.directTerms.length
      || record.matchEvidence.conceptTerms.length
      || record.matchEvidence.nameAlignedTerms.length)
    .sort(compareCandidates);
  const unique = uniqueCandidates(candidates);
  const selectable = unique.filter((candidate) => !["write", "destructive"].includes(candidate.authority));
  const recommendation = selectable[0] || unique[0] || null;

  if (!recommendation) {
    return {
      outcome: requestedOutcome,
      status: "no_candidate",
      requiredAuthority: intent.requiredAuthority,
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
    confidence: confidence(recommendation),
    requiredAuthority: intent.requiredAuthority,
    automaticAction: false,
    recommendation,
    alternatives,
    deferred,
    nextSafeStep: nextSafeStep(recommendation),
    boundary,
  };
}

function candidateRecord({ artifact, score, matched }, intent) {
  const policy = candidatePolicy(artifact, matched, intent);
  const blockers = readinessBlockers(artifact.lifecycle);
  return {
    artifact: recommendationArtifact(artifact),
    queryScore: score,
    recommendationScore: score
      + readinessWeight(artifact.lifecycle)
      + policy.scoreAdjustment,
    matched,
    matchedMeaningfulTerms: [...new Set([
      ...policy.directTerms,
      ...policy.conceptTerms,
      ...policy.nameAlignedTerms,
    ])],
    matchEvidence: {
      directTerms: policy.directTerms,
      conceptTerms: policy.conceptTerms,
      nameAlignedTerms: policy.nameAlignedTerms,
    },
    authority: policy.authority,
    authorityAlignment: authorityAlignment(intent.requiredAuthority.class, policy.authority),
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

function confidence(candidate) {
  const evidence = candidate.matchEvidence;
  if (evidence.nameAlignedTerms.length >= 2 || evidence.directTerms.length >= 3) return "high";
  if (evidence.nameAlignedTerms.length >= 1
    || evidence.directTerms.length >= 2
    || (evidence.directTerms.length && evidence.conceptTerms.length)) return "medium";
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
