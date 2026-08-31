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

const GENERIC_NAME_ACTION_TERMS = new Set(["add", "create", "new"]);

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
  // A negative "without" clause is a boundary, not a tool-selection target.
  // "Before" can carry useful nouns (for example, "before a local commit"),
  // so only its mutating verbs are removed below.
  const primaryClause = value.split(/\bwithout\b/i, 1)[0];
  const baseTerms = unique(slugify(primaryClause).split("-")
    .filter((term) => term.length > 1)
    .map(canonicalTerm)
    .filter((term) => !beforeConstraintActions(value).has(term))
    .filter((term) => !GENERIC_TERMS.has(term) && !STOP_TERMS.has(term)));
  const rawTerms = unique([...baseTerms, ...derivedIntentTerms(baseTerms)]);
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
  const nameAlignedTerms = intent.rawTerms.filter((term) => nameTerms.includes(term) && !GENERIC_NAME_ACTION_TERMS.has(term));
  const meaningfulNameTerms = nameTerms.filter((term) => !GENERIC_TERMS.has(term)
    && !STOP_TERMS.has(term)
    && !GENERIC_NAME_ACTION_TERMS.has(term));
  const nameCoverage = meaningfulNameTerms.length
    ? nameAlignedTerms.length / meaningfulNameTerms.length
    : 0;
  const intentCoverage = intent.rawTerms.length ? directTerms.length / intent.rawTerms.length : 0;
  const authority = authorityClass(artifact);
  const taskSurface = ["workflow-route", "skill", "helper-script", "command"].includes(artifact.type);
  return {
    directTerms,
    conceptTerms,
    nameAlignedTerms,
    nameCoverage,
    intentCoverage,
    authority,
    scoreAdjustment: (TYPE_WEIGHT[artifact.type] || 0)
      + (AUTHORITY_WEIGHT[authority] || 0)
      + directTerms.length * (taskSurface ? 3 : 1)
      + nameAlignedTerms.length * (taskSurface ? 6 : 1)
      + Math.round(nameCoverage * (taskSurface ? 20 : 2))
      + Math.round(intentCoverage * (taskSurface ? 16 : 2)),
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
  if (/(read only|without (write|writes|writing|change|changes|mutation|publish|publishing|publication|deploy|deploying|push|pushing|merge|merging|tag|tagging|release|releasing)|before (edit|editing|write|writing))/.test(normalised)) {
    return authority("read_only", "the outcome explicitly limits work to inspection");
  }
  if (/\b(delete|destroy|drop|purge|revoke|wipe)\b/.test(normalised)) {
    return authority("destructive", "the outcome requests a destructive action");
  }
  if (/\b(secret|credential|password|token|authenticate|authentication)\b/.test(normalised)) {
    return authority("sensitive_access", "the outcome requires protected authentication or secret material");
  }
  if (/\b(change|create|edit|modify|set|update|write)\b.*\bgoogle\s+(?:doc|document|drive|sheet|sheets|slide|slides|spreadsheet|spreadsheets)\b/.test(normalised)) {
    return authority("external_write", "the outcome requests a mutation in an external application");
  }
  if (/\b(change|modify|set|update)\b.*\b(plugin|app|connector)\b.*\b(permission|permissions|setting|settings)\b/.test(normalised)) {
    return authority("external_write", "the outcome requests an external capability-setting mutation");
  }
  if (/\b(publish|deploy|push|merge|release|tag)\b/.test(normalised)) {
    return authority("external_write", "the outcome requests an external mutation");
  }
  if (/\b(add|animate|append|capture|compile|create|edit|extract|fix|generate|insert|install|migrate|modify|record|turn|update|write)\b/.test(normalised)) {
    return authority("local_write", "the outcome requests a local change");
  }
  if (/\b(audit|check|compare|find|inspect|inventory|list|map|prove|query|recover|research|review|search|summarize|validate|verify)\b/.test(normalised)) {
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
  if (["autonomous", "autonomy"].includes(term)) return "autonomy";
  if (["completion", "completions", "completed"].includes(term)) return "completion";
  if (["blocker", "blockers", "blocked"].includes(term)) return "blocker";
  if (["resume", "resumed", "resumption", "resumptions"].includes(term)) return "resume";
  if (["repository", "repositories", "repo", "repos"].includes(term)) return "project";
  if (["multiple", "multi"].includes(term)) return "multi";
  if (["session", "sessions"].includes(term)) return "session";
  if (["extract", "extracted", "extracting", "extraction"].includes(term)) return "extract";
  if (["outcome", "outcomes"].includes(term)) return "outcome";
  if (["file", "files"].includes(term)) return "file";
  return term;
}

function beforeConstraintActions(value) {
  const tail = String(value || "").split(/\bbefore\b/i).slice(1).join(" ");
  if (!tail) return new Set();
  const actions = new Set(["editing", "write", "writing", "change", "changes", "changing", "modify", "modifying"]);
  return new Set(slugify(tail).split("-").map(canonicalTerm).filter((term) => actions.has(term)));
}

function derivedIntentTerms(terms) {
  const set = new Set(terms);
  const derived = [];
  if (set.has("recover") || set.has("recovery") || set.has("interrupted")) derived.push("resume", "next");
  if (set.has("autonomy") && ["completion", "blocker", "resume"].some((term) => set.has(term))) derived.push("outcome");
  if (set.has("multi") && set.has("project")) derived.push("proof");
  if (set.has("skill") && set.has("missing")) derived.push("gap");
  if (set.has("skill") && ["hygiene", "stale", "cleanup"].some((term) => set.has(term))) derived.push("cleaner");
  if (set.has("staged") && set.has("commit")) derived.push("pre", "check");
  return derived;
}
