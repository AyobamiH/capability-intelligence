import assert from "node:assert/strict";
import test from "node:test";
import { createArtifact } from "../src/model.js";
import { authorityClass, recommendCapability } from "../src/recommend.js";

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

test("authority classification distinguishes read, write, destructive, and unknown", () => {
  assert.equal(authorityClass(artifact("read", "Read", "app-tool", { annotations: { readOnlyHint: true } })), "read_only");
  assert.equal(authorityClass(artifact("write", "Write", "app-tool", { annotations: { openWorldHint: true } })), "write");
  assert.equal(authorityClass(artifact("delete", "Delete", "app-tool", { annotations: { destructiveHint: true } })), "destructive");
  assert.equal(authorityClass(artifact("unknown", "Unknown", "skill")), "unknown");
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
