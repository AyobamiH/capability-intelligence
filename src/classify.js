import { slugify, unique } from "./utils.js";

const CONCEPTS = {
  video: ["video", "motion", "animation", "caption", "render", "hyperframes", "remotion"],
  design: ["design", "figma", "image", "visual", "creative", "ui", "ux"],
  code: ["code", "coding", "repository", "github", "pull request", "ci", "build", "test"],
  documents: ["document", "docs", "drive", "notion", "word", "pdf", "knowledge"],
  communication: ["email", "gmail", "outlook", "calendar", "meeting", "slack", "teams"],
  data: ["database", "sql", "analytics", "spreadsheet", "warehouse", "data"],
  deployment: ["deploy", "cloud", "hosting", "release", "publish", "infrastructure"],
  security: ["security", "secret", "credential", "audit", "permission", "vulnerability"],
  workflow: ["workflow", "orchestration", "automation", "route", "agent"],
  research: ["research", "search", "web", "market", "news", "evidence"],
};

export function inferCapabilities(...values) {
  const fields = values.filter(Boolean).map(normalisedTokens);
  const labels = [];
  for (const [label, words] of Object.entries(CONCEPTS)) {
    if (words.some((word) => fields.some((tokens) => containsTerm(tokens, word)))) labels.push(label);
  }
  return unique(labels);
}

function normalisedTokens(value) {
  return slugify(value).split("-").filter(Boolean);
}

function containsTerm(tokens, term) {
  const expected = normalisedTokens(term);
  if (!expected.length || expected.length > tokens.length) return false;
  return tokens.some((_, index) =>
    expected.every((word, offset) => tokenMatches(tokens[index + offset], word)),
  );
}

function tokenMatches(actual, expected) {
  if (actual === expected) return true;
  if (expected.length <= 2) return false;
  const forms = [
    `${expected}s`,
    `${expected}es`,
    `${expected}ed`,
    `${expected}ing`,
  ];
  if (expected.endsWith("e")) forms.push(`${expected.slice(0, -1)}ing`);
  if (expected.endsWith("y")) forms.push(`${expected.slice(0, -1)}ies`);
  return forms.includes(actual);
}

export function outcomeTokens(query) {
  const raw = slugify(query).split("-").filter((token) => token.length > 2);
  const expanded = [...raw];
  for (const [concept, words] of Object.entries(CONCEPTS)) {
    if (raw.includes(concept) || words.some((word) => raw.includes(word))) expanded.push(concept);
  }
  return unique(expanded);
}

export function matchOutcome(artifact, query) {
  const tokens = outcomeTokens(query);
  const fields = [artifact.name, artifact.description, ...(artifact.capabilities || [])]
    .join(" ")
    .toLowerCase();
  const matched = tokens.filter((token) => fields.includes(token));
  const normalisedName = slugify(artifact.name).replaceAll("-", " ");
  const originalTokens = slugify(query).split("-").filter((token) => token.length > 2);
  const nameMatches = originalTokens.filter((token) => normalisedName.includes(token));

  // Readiness can rank relevant capabilities, but it cannot create relevance.
  // Keeping this gate before lifecycle scoring preserves a truthful no-match
  // result for empty, malformed, and genuinely unrelated outcome queries.
  if (!matched.length && !nameMatches.length) return { score: 0, matched: [] };

  let score = matched.length + nameMatches.length * 2;
  if (artifact.lifecycle.runnable === "yes") score += 3;
  else if (artifact.lifecycle.installed === "yes") score += 2;
  else if (artifact.lifecycle.present === "yes") score += 1;
  if (["high", "critical"].includes(artifact.risk.level)) score -= 1;
  return { score, matched };
}
