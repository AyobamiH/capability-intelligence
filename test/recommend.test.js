import assert from "node:assert/strict";
import test from "node:test";
import { createArtifact } from "../src/model.js";
import { authorityClass, recommendCapability } from "../src/recommend.js";
import { outcomeIntent } from "../src/recommend-policy.js";

test("recommendation favors a task route over a destructive lexical match", () => {
  const inventory = fixtureInventory([
    artifact("delete-review", "Delete pull request review", "app-tool", {
      description: "Delete a GitHub pull request review.",
      annotations: { destructiveHint: true, openWorldHint: true },
      risk: { level: "critical", reasons: ["destructive tool", "open-world effect"] },
    }),
    artifact("review-route", "github deep review", "workflow-route", {
      description: "Review a GitHub pull request with read-only evidence.",
      lifecycle: { installed: "yes" },
      permissionLevel: "local_execution, github-read",
    }),
  ]);

  const report = recommendCapability(inventory, "review a GitHub pull request");
  assert.equal(report.status, "candidate_found");
  assert.equal(report.recommendation.artifact.id, "review-route");
  assert.equal(report.recommendation.authority, "read_only");
  assert.equal(report.requiredAuthority.class, "read_only");
  assert.equal(report.recommendation.authorityAlignment, "compatible");
  assert.equal(report.automaticAction, false);
  assert.equal(report.deferred[0].authority, "destructive");
});

test("recommendation exposes readiness gaps and remains deterministic", () => {
  const inventory = fixtureInventory([
    artifact("github-skill", "GitHub review", "skill", {
      description: "Review a GitHub pull request.",
      lifecycle: { installed: "yes" },
    }),
  ]);
  const first = recommendCapability(inventory, "review a GitHub pull request");
  const second = recommendCapability(inventory, "review a GitHub pull request");
  assert.deepEqual(first, second);
  assert.ok(first.recommendation.blockers.includes("authenticated is not proven"));
  assert.ok(first.recommendation.blockers.includes("verified is not proven"));
  assert.match(first.nextSafeStep, /prove its readiness gates/);
});

test("recommendation refuses generic prompts and reports true no-match outcomes", () => {
  const inventory = fixtureInventory([
    artifact("video", "Product video", "skill", { description: "Create a product video." }),
  ]);
  assert.equal(recommendCapability(inventory, "agents need tools").status, "outcome_too_broad");
  assert.equal(recommendCapability(inventory, "audit quantum pottery").status, "no_candidate");
});

test("recommendation ignores stopwords and favors name-aligned documentation tooling", () => {
  const inventory = fixtureInventory([
    artifact("review-route", "github deep review", "workflow-route", {
      description: "Review repository code.",
      lifecycle: { installed: "yes" },
      permissionLevel: "local_execution, github-read",
      capabilities: ["code"],
    }),
    artifact("docs-list", "docs list", "helper-script", {
      description: "Inventory repository documents.",
      lifecycle: { installed: "yes" },
      capabilities: ["documents"],
    }),
    artifact("google-docs", "google docs", "skill", {
      description: "Create and edit documents.",
      lifecycle: { installed: "yes" },
      capabilities: ["documents"],
    }),
  ]);
  const report = recommendCapability(inventory, "inventory repository documentation before editing");
  assert.equal(report.recommendation.artifact.id, "docs-list");
  assert.equal(report.requiredAuthority.class, "read_only");
  assert.ok(report.recommendation.matchEvidence.nameAlignedTerms.includes("documents"));
  assert.equal(report.recommendation.matchedMeaningfulTerms.includes("before"), false);
});

test("recommendation preserves useful before-context and normalizes agent-work intent", () => {
  const inventory = fixtureInventory([
    artifact("windows-scan", "windows scan local files", "helper-script"),
    artifact("precommit", "pre commit check", "helper-script"),
    artifact("release", "release preflight local route", "workflow-route"),
    artifact("outcomes", "autonomy outcomes", "helper-script"),
    artifact("probe", "read only probes", "helper-script"),
    artifact("multi", "multi project proof", "helper-script"),
    artifact("packaging", "skills library packaging skill", "skill"),
    artifact("gap", "add skill gap", "helper-script"),
    artifact("env", "env audit skill", "skill"),
    artifact("cleaner", "skill cleaner", "helper-script"),
    artifact("package-run", "package candidate dry run", "workflow-route"),
    artifact("run-next", "run next", "helper-script"),
  ]);

  assert.equal(recommendCapability(inventory, "validate exact staged files and secrets before a local commit").recommendation.artifact.id, "precommit");
  assert.equal(recommendCapability(inventory, "summarize autonomous route completions blockers and resumptions from local evidence").recommendation.artifact.id, "outcomes");
  assert.equal(recommendCapability(inventory, "prove the same read-only workflow contracts across multiple repositories").recommendation.artifact.id, "multi");
  assert.equal(recommendCapability(inventory, "record one missing reusable skill contract without duplicating the backlog").recommendation.artifact.id, "gap");
  assert.equal(recommendCapability(inventory, "audit workflow skill documents for routing hygiene and stale metadata").recommendation.artifact.id, "cleaner");
  assert.equal(recommendCapability(inventory, "recover an interrupted autonomous workflow run without changing files").recommendation.artifact.id, "run-next");
});

test("recommendation favors the requested object over generic create and context terms", () => {
  const inventory = fixtureInventory([
    artifact("recut", "talking-head-recut", "skill", {
      description: "Package a talking-head video with graphic overlays.",
      lifecycle: { installed: "yes" },
    }),
    artifact("captions", "embedded-captions", "skill", {
      description: "Add captions to a talking-head video.",
      lifecycle: { installed: "yes" },
    }),
    artifact("figma", "figma-create-new-file", "skill", {
      description: "Create a new Figma file with a skill.",
      lifecycle: { installed: "yes" },
    }),
    artifact("skill-creator", "skill-creator", "skill", {
      description: "Create a new Codex skill.",
      lifecycle: { installed: "yes" },
    }),
  ]);

  const captions = recommendCapability(inventory, "add captions to a talking-head video");
  assert.equal(captions.recommendation.artifact.id, "captions");
  assert.equal(captions.requiredAuthority.class, "local_write");
  assert.equal(captions.recommendation.matchEvidence.intentCoverage, 1);

  const skill = recommendCapability(inventory, "create a new Codex skill");
  assert.equal(skill.recommendation.artifact.id, "skill-creator");
  assert.equal(skill.recommendation.matchEvidence.nameAlignedTerms.includes("create"), false);
  assert.equal(skill.recommendation.matchEvidence.nameAlignedTerms.includes("new"), false);
});

test("recommendation evaluates relevant candidates beyond the display search page", () => {
  const distractors = Array.from({ length: 120 }, (_, index) => artifact(
    `distractor-${index}`,
    `generic helper ${index}`,
    "skill",
    { description: "Inventory repository documentation before editing.", lifecycle: { installed: "yes" }, capabilities: ["documents", "code"] },
  ));
  const inventory = fixtureInventory([
    ...distractors,
    artifact("docs-list", "docs list", "helper-script", {
      description: "Inventory repository documents.",
      lifecycle: { installed: "yes" },
      capabilities: ["documents"],
    }),
  ]);
  const report = recommendCapability(inventory, "inventory repository documentation before editing");
  assert.equal(report.recommendation.artifact.id, "docs-list");
});

test("outcome intent states authority demanded by the task", () => {
  assert.equal(outcomeIntent("review a pull request without writes").requiredAuthority.class, "read_only");
  assert.equal(outcomeIntent("validate release readiness without publishing").requiredAuthority.class, "read_only");
  assert.equal(outcomeIntent("summarize autonomous route outcomes").requiredAuthority.class, "read_only");
  assert.equal(outcomeIntent("prove workflow contracts across repositories").requiredAuthority.class, "read_only");
  assert.equal(outcomeIntent("fix failing CI").requiredAuthority.class, "local_write");
  assert.equal(outcomeIntent("add captions to a talking-head video").requiredAuthority.class, "local_write");
  assert.equal(outcomeIntent("animate a Three.js scene").requiredAuthority.class, "local_write");
  assert.equal(outcomeIntent("capture a website into a social video").requiredAuthority.class, "local_write");
  assert.equal(outcomeIntent("turn a pull request into a video").requiredAuthority.class, "local_write");
  assert.equal(outcomeIntent("research a topic with citations").requiredAuthority.class, "read_only");
  assert.equal(outcomeIntent("inspect and change plugin permission settings").requiredAuthority.class, "external_write");
  assert.equal(outcomeIntent("analyze and update a Google spreadsheet").requiredAuthority.class, "external_write");
  assert.equal(outcomeIntent("edit a Google Slides deck").requiredAuthority.class, "external_write");
  assert.equal(outcomeIntent("record a missing skill contract").requiredAuthority.class, "local_write");
  assert.equal(outcomeIntent("extract sessions into a private corpus").requiredAuthority.class, "local_write");
  assert.equal(outcomeIntent("publish an npm package").requiredAuthority.class, "external_write");
  assert.equal(outcomeIntent("deliver a secret to a command").requiredAuthority.class, "sensitive_access");
  assert.equal(outcomeIntent("delete production rows").requiredAuthority.class, "destructive");
});

test("authority classification distinguishes read, write, destructive, and unknown", () => {
  assert.equal(authorityClass(artifact("read", "Read", "app-tool", { annotations: { readOnlyHint: true } })), "read_only");
  assert.equal(authorityClass(artifact("write", "Write", "app-tool", { annotations: { openWorldHint: true } })), "write");
  assert.equal(authorityClass(artifact("delete", "Delete", "app-tool", { annotations: { destructiveHint: true } })), "destructive");
  assert.equal(authorityClass(artifact("unknown", "Unknown", "skill")), "unknown");
  assert.equal(authorityClass(artifact("secret", "Secret", "workflow-route", { permissionLevel: "local_execution, secret-access" })), "sensitive_access");
  assert.equal(authorityClass(artifact("publish", "Publish", "workflow-route", { permissionLevel: "local_execution, remote_publication" })), "write");
});

function fixtureInventory(artifacts) {
  return { artifacts };
}

function artifact(id, name, type, options = {}) {
  return createArtifact({
    id,
    name,
    type,
    source: "fixture",
    description: options.description || name,
    capabilities: options.capabilities || [],
    lifecycle: { discovered: "yes", present: "yes", ...(options.lifecycle || {}) },
    risk: options.risk || { level: "low", reasons: [] },
    metadata: {
      ...(options.annotations ? { annotations: options.annotations } : {}),
      ...(options.permissionLevel ? { permissionLevel: options.permissionLevel } : {}),
    },
  });
}
