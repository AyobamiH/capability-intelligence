import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { scanEnvironment, findUnsafeOutput, redactedInventory } from "../src/scanner.js";
import { hostDiff, inspectArtifact, queryArtifactPage, searchArtifacts, unlabelledPluginReport } from "../src/query.js";
import { validateInventoryShape } from "../src/validation.js";
import { fixtureHome } from "./helpers/fixture-home.js";

const CLOCK = () => new Date("2026-07-16T12:00:00.000Z");

test("a complete synthetic environment is represented without silent loss", (t) => {
  const home = fixtureHome(t);
  const inventory = scanEnvironment({ home, clock: CLOCK });
  assert.equal(inventory.coverage.status, "passed");
  assert.equal(inventory.generatedAt, "2026-07-16T12:00:00.000Z");
  assert.equal(inventory.artifacts.filter(
    (artifact) => artifact.source === "codex-plugin-catalog" && artifact.type === "plugin",
  ).length, 3);
  assert.equal(inventory.artifacts.filter((artifact) => artifact.type === "plugin-installation").length, 2);
  assert.equal(inventory.artifacts.filter((artifact) => artifact.type === "app-integration").length, 3);
  assert.equal(inventory.artifacts.filter((artifact) => artifact.type === "mcp-server").length, 3);
  assert.equal(inventory.coverage.unlabelledManifests, 2);
  assert.equal(inventory.artifacts.filter((artifact) => artifact.type === "app-tool").length, 2);
  assert.equal(inventory.artifacts.filter((artifact) => artifact.type === "connector").length, 2);
  assert.ok(inventory.artifacts.some((artifact) => artifact.source === "coding-workflow-library"));
  assert.equal(inventory.artifacts.filter((artifact) => artifact.source === "openclaw-native-plugins").length, 3);
  assert.deepEqual(findUnsafeOutput(inventory), []);
  assert.deepEqual(validateInventoryShape(inventory), []);
});

test("OpenClaw plugin manifests are represented without configuration or runtime overclaiming", (t) => {
  const inventory = scanEnvironment({ home: fixtureHome(t), clock: CLOCK });
  const records = inventory.artifacts.filter((artifact) => artifact.source === "openclaw-native-plugins");
  assert.deepEqual(records.map((artifact) => artifact.metadata.origin).sort(), ["bundled", "local-extension", "managed-npm"]);
  assert.ok(records.every((artifact) => artifact.hosts.includes("openclaw")));
  assert.ok(records.every((artifact) => artifact.lifecycle.enabled === "unknown"));
  assert.ok(records.every((artifact) => artifact.lifecycle.authenticated === "unknown"));
  assert.equal(JSON.stringify(records).includes("configSchema"), false);
});

test("catalogue integrations and installed plugin resources are first-class artifacts", (t) => {
  const inventory = scanEnvironment({ home: fixtureHome(t), clock: CLOCK });
  const installations = inventory.artifacts.filter((artifact) => artifact.type === "plugin-installation");
  assert.deepEqual(installations.map((artifact) => artifact.metadata.version).sort(), ["0.9.0", "1.0.0"]);
  assert.ok(installations.every((artifact) => artifact.lifecycle.installed === "yes"));
  assert.ok(installations.every((artifact) => inventory.graph.edges.some((edge) => edge.to === artifact.id && edge.type === "installed-as")));
  const declaredSource = inventory.sources.find((source) => source.id === "codex-plugin-declared-integrations");
  assert.equal(declaredSource.records, 2);
  assert.equal(declaredSource.represented, 2);
});

test("unlabelled manifests remain visible with unknown verification", (t) => {
  const inventory = scanEnvironment({ home: fixtureHome(t), clock: CLOCK });
  const beta = inventory.artifacts.find((artifact) => artifact.id === "plugin:beta");
  assert.equal(beta.metadata.manifestCapabilityStatus, "unlabelled");
  assert.ok(["inferred", "structural"].includes(beta.classificationEvidence));
  assert.equal(beta.lifecycle.verified, "unknown");
});

test("unlabelled manifest report exposes purpose metadata without lifecycle overclaiming", (t) => {
  const inventory = scanEnvironment({ home: fixtureHome(t), clock: CLOCK });
  const report = unlabelledPluginReport(inventory);
  assert.equal(report.generatedAt, "2026-07-16T12:00:00.000Z");
  assert.equal(report.count, 2);
  assert.equal(report.inferredCount, 2);
  assert.equal(report.structuralCount, 0);
  assert.deepEqual(report.records.map((record) => record.name), ["Beta", "Gamma"]);
  assert.ok(report.records.every((record) => record.lifecycle.verified === "unknown"));
  assert.ok(report.records.every((record) => record.lifecycle.authenticated === "unknown"));
  assert.ok(report.records.every((record) => !("relativeLocation" in record)));
  assert.deepEqual(findUnsafeOutput(report), []);
});

test("installed does not imply enabled, authenticated, runnable, or verified", (t) => {
  const inventory = scanEnvironment({ home: fixtureHome(t), clock: CLOCK });
  const alpha = inventory.artifacts.find((artifact) => artifact.id === "plugin:alpha");
  assert.equal(alpha.lifecycle.installed, "yes");
  assert.equal(alpha.lifecycle.enabled, "unknown");
  assert.equal(alpha.lifecycle.authenticated, "unknown");
  assert.equal(alpha.lifecycle.runnable, "unknown");
  assert.equal(alpha.lifecycle.verified, "unknown");
});

test("tool annotations drive risk without exposing tool payload schemas", (t) => {
  const inventory = scanEnvironment({ home: fixtureHome(t), clock: CLOCK });
  const destructive = inventory.artifacts.find((artifact) => artifact.name === "Delete record");
  const readOnly = inventory.artifacts.find((artifact) => artifact.name === "List records");
  assert.equal(destructive.risk.level, "critical");
  assert.equal(readOnly.risk.level, "low");
  assert.equal(destructive.metadata.inputFieldCount, 1);
  assert.equal("inputSchema" in destructive.metadata, false);
});

test("connector snapshots deduplicate by hidden identity", (t) => {
  const inventory = scanEnvironment({ home: fixtureHome(t), clock: CLOCK });
  const source = inventory.sources.find((candidate) => candidate.id === "codex-app-directory");
  assert.equal(source.records, 3);
  assert.equal(source.represented, 2);
  assert.equal(source.deduplicated, 1);
  const output = JSON.stringify(inventory);
  assert.equal(output.includes("connector-private-one"), false);
  assert.equal(output.includes("install.example"), false);
});

test("duplicate skill names and host drift are explicit", (t) => {
  const inventory = scanEnvironment({ home: fixtureHome(t), clock: CLOCK });
  const duplicate = inventory.graph.duplicates.find((record) => record.name === "shared");
  assert.ok(duplicate);
  assert.ok(duplicate.artifactIds.length >= 3);
  const difference = hostDiff(inventory, "codex", "claude");
  assert.ok(difference.some((record) => record.name === "Codex only"));
});

test("outcome search is deterministic and readiness-aware", (t) => {
  const inventory = scanEnvironment({ home: fixtureHome(t), clock: CLOCK });
  const first = searchArtifacts(inventory, "create a product video");
  const second = searchArtifacts(inventory, "create a product video");
  assert.deepEqual(first, second);
  assert.ok(first.some((result) => result.artifact.name === "Alpha Video"));
  assert.ok(first.every((result) => result.matched.length > 0));
});

test("outcome search does not manufacture relevance from readiness", (t) => {
  const inventory = scanEnvironment({ home: fixtureHome(t), clock: CLOCK });
  assert.deepEqual(searchArtifacts(inventory, ""), []);
  assert.deepEqual(searchArtifacts(inventory, "qxvplm"), []);
});

test("artifact pages share search semantics and remain bounded", (t) => {
  const inventory = scanEnvironment({ home: fixtureHome(t), clock: CLOCK });
  const first = queryArtifactPage(inventory, { limit: 2 });
  const second = queryArtifactPage(inventory, { offset: 2, limit: 2 });
  const query = queryArtifactPage(inventory, { query: "product video", limit: 2 });
  assert.equal(first.items.length, 2);
  assert.equal(first.hasNext, true);
  assert.equal(second.offset, 2);
  assert.ok(query.items.some((result) => result.artifact.name === "Alpha Video"));
  assert.ok(query.items.every((result) => result.score > 0));
});

test("inspection includes graph relationships", (t) => {
  const inventory = scanEnvironment({ home: fixtureHome(t), clock: CLOCK });
  const result = inspectArtifact(inventory, "plugin:alpha");
  assert.equal(result.artifact.name, "Alpha Video");
  assert.ok(result.outgoing.some((edge) => edge.type === "contains"));
});

test("redacted export removes private descriptions and local locations", (t) => {
  const home = fixtureHome(t);
  const inventory = scanEnvironment({ home, clock: CLOCK });
  const redacted = redactedInventory(inventory);
  const localSkill = redacted.artifacts.find((artifact) => artifact.source === "codex-user-skills");
  assert.equal(localSkill.description, "Description withheld in redacted export.");
  assert.equal("relativeLocation" in localSkill.metadata, false);
  assert.equal(JSON.stringify(redacted).includes(home), false);
  assert.equal(redacted.coverage.status, "passed");
});

test("malformed allowlisted JSON fails strict coverage without source contents", (t) => {
  const home = fixtureHome(t);
  const badFile = path.join(home, ".codex/cache/codex_apps_tools/bad.json");
  fs.mkdirSync(path.dirname(badFile), { recursive: true });
  fs.writeFileSync(badFile, "{private payload");
  const inventory = scanEnvironment({ home, clock: CLOCK });
  assert.equal(inventory.coverage.status, "failed");
  assert.ok(inventory.coverage.failures.some((failure) => failure.includes("parse failure")));
  assert.equal(JSON.stringify(inventory).includes("private payload"), false);
});

test("unsafe values and forbidden output fields are detected", () => {
  assert.ok(findUnsafeOutput({ authorizationHeader: "withheld" }).length > 0);
  assert.ok(findUnsafeOutput({ value: "/home/private-user/secret" }).length > 0);
  assert.ok(findUnsafeOutput({ value: "eyJabc.def.ghi" }).length > 0);
});

test("detailed inventory validation rejects invalid lifecycle and source shapes", (t) => {
  const inventory = scanEnvironment({ home: fixtureHome(t), clock: CLOCK });
  const invalid = structuredClone(inventory);
  invalid.sources[0].records = -1;
  invalid.artifacts[0].lifecycle.verified = "probably";
  const failures = validateInventoryShape(invalid);
  assert.ok(failures.some((failure) => failure.includes("records")));
  assert.ok(failures.some((failure) => failure.includes("verified")));
});

test("equivalent scans produce byte-equivalent JSON", (t) => {
  const home = fixtureHome(t);
  const first = scanEnvironment({ home, clock: CLOCK });
  const second = scanEnvironment({ home, clock: CLOCK });
  assert.equal(JSON.stringify(first), JSON.stringify(second));
});
