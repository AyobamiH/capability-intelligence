import { outcomeTokens } from "./classify.js";
import { slugify, unique } from "./utils.js";

const GENERIC_TERMS = new Set([
  "agent", "agents", "capability", "capabilities", "help", "need", "needs",
  "tool", "tools", "use", "using", "workflow", "workflows",
]);

const STOP_TERMS = new Set([
  "and", "before", "for", "from", "into", "its", "of", "on", "or", "that",
  "the", "this", "to", "with", "without", "your",
]);

const TYPE_WEIGHT = Object.freeze({
  "workflow-route": 8,
  skill: 5,
  "helper-script": 3,
  command: 2,
  "app-tool": 0,
  plugin: 1,
  connector: 0,
  schema: -4,
  template: -4,
  "documentation-control": -5,
});

const AUTHORITY_WEIGHT = Object.freeze({
  read_only: 3,
  unknown: 0,
  sensitive_access: -2,
  write: -5,
  destructive: -12,
});

export function outcomeIntent(outcome) {
  const value = String(outcome || "").trim();
  // Clauses after "before" and "without" constrain the requested action;
  // treating them as capability targets made editing tools rank for inspection.
  const primaryClause = value.split(/\b(?:before|without)\b/i, 1)[0];
  const rawTerms = unique(slugify(primaryClause).split("-")
    .filter((term) => term.length > 1)
    .map(canonicalTerm)
    .filter((term) => !GENERIC_TERMS.has(term) && !STOP_TERMS.has(term)));
  const expandedTerms = unique(outcomeTokens(value)
    .map(canonicalTerm)
    .filter((term) => !GENERIC_TERMS.has(term) && !STOP_TERMS.has(term)));
  return {
    value,
    rawTerms,
    conceptTerms: expandedTerms.filter((term) => !rawTerms.includes(term)),
    requiredAuthority: requiredAuthority(value),
  };
}

export function candidatePolicy(artifact, matched, intent) {
  const canonicalMatched = unique(matched.map(canonicalTerm));
  const nameTerms = unique(slugify(artifact.name).split("-").filter(Boolean).map(canonicalTerm));
  const directTerms = intent.rawTerms.filter((term) => canonicalMatched.includes(term));
  const conceptTerms = intent.conceptTerms.filter((term) => canonicalMatched.includes(term));
  const nameAlignedTerms = intent.rawTerms.filter((term) => nameTerms.includes(term));
  const authority = authorityClass(artifact);
  const taskSurface = ["workflow-route", "skill", "helper-script", "command"].includes(artifact.type);
  return {
    directTerms,
    conceptTerms,
    nameAlignedTerms,
    authority,
    scoreAdjustment: (TYPE_WEIGHT[artifact.type] || 0)
      + (AUTHORITY_WEIGHT[authority] || 0)
      + directTerms.length * (taskSurface ? 3 : 1)
      + nameAlignedTerms.length * (taskSurface ? 6 : 1),
  };
}

export function authorityClass(artifact) {
  const annotations = artifact.metadata?.annotations || {};
  const reasons = artifact.risk?.reasons || [];
  const permission = String(artifact.metadata?.permissionLevel || "").toLowerCase();

  if (annotations.destructiveHint === true || reasons.includes("destructive tool") || permission.includes("destructive")) return "destructive";
  if (permission.includes("secret-access") && !permission.includes("secret_mutation")) return "sensitive_access";
  if (annotations.openWorldHint === true && annotations.readOnlyHint !== true) return "write";
  if (reasons.includes("open-world write capability")) return "write";
  if (annotations.readOnlyHint === true || reasons.includes("declared read-only")) return "read_only";
  if (permission && /(^|[, ]+)([^, ]*-read|read-only)([, ]+|$)/.test(permission)
    && !/(write|publish|deploy|mutation|admin|delete|merge)/.test(permission)) return "read_only";
  if (/(write|publish|publication|deploy|mutation|admin|delete|merge)/.test(permission)) return "write";
  return "unknown";
}

export function authorityAlignment(required, actual) {
  if (required === "unspecified") return "not_required";
  if (required === actual) return "compatible";
  if (actual === "unknown") return "unproven";
  if (required === "read_only" && ["write", "destructive", "sensitive_access"].includes(actual)) return "exceeds_request";
  if (["local_write", "external_write"].includes(required) && actual === "read_only") return "guidance_only";
  return "different_authority";
}

function requiredAuthority(value) {
  const normalised = slugify(value).replaceAll("-", " ");
  if (/(read only|without (write|writes|writing|change|changes|mutation)|before (edit|editing|write|writing))/.test(normalised)) {
    return authority("read_only", "the outcome explicitly limits work to inspection");
  }
  if (/\b(delete|destroy|drop|purge|revoke|wipe)\b/.test(normalised)) {
    return authority("destructive", "the outcome requests a destructive action");
  }
  if (/\b(secret|credential|password|token|authenticate|authentication)\b/.test(normalised)) {
    return authority("sensitive_access", "the outcome requires protected authentication or secret material");
  }
  if (/\b(publish|deploy|push|merge|release|tag)\b/.test(normalised)) {
    return authority("external_write", "the outcome requests an external mutation");
  }
  if (/\b(create|edit|fix|insert|install|migrate|modify|update|write)\b/.test(normalised)) {
    return authority("local_write", "the outcome requests a local change");
  }
  if (/\b(review|inspect|inventory|list|query|audit|check)\b/.test(normalised)) {
    return authority("read_only", "the outcome requests inspection");
  }
  return authority("unspecified", "the outcome does not establish an authority class");
}

function authority(className, reason) {
  return { class: className, reason };
}

function canonicalTerm(term) {
  if (["doc", "docs", "document", "documentation"].includes(term)) return "documents";
  if (term === "gh") return "github";
  if (["deliver", "delivered", "delivering"].includes(term)) return "delivery";
  if (["edit", "edited", "editing"].includes(term)) return "editing";
  if (["inventory", "list", "listing"].includes(term)) return "inventory";
  return term;
}
