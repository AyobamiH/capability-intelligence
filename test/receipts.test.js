import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { runCli } from "../src/cli.js";
import { artifactFingerprint, applyObservedReceipts, loadReceiptBundle, validateReceiptBundle } from "../src/receipts.js";
import { scanEnvironment } from "../src/scanner.js";
import { fixtureHome } from "./helpers/fixture-home.js";

const CLOCK = () => new Date("2026-07-16T12:00:00.000Z");
const NOW = "2026-07-16T12:01:00.000Z";
const CHECKS = [
  "artifact_identity_matched",
  "invocation_completed",
  "expected_outcome_observed",
  "no_secret_output",
];

test("latest matching passed receipt verifies only its current artifact", (t) => {
  const inventory = scanEnvironment({ home: fixtureHome(t), clock: CLOCK });
  const alpha = inventory.artifacts.find((artifact) => artifact.id === "plugin:alpha");
  const bundle = receiptBundle(alpha);
  const result = applyObservedReceipts(inventory, bundle, { now: NOW });
  const verified = result.inventory.artifacts.find((artifact) => artifact.id === alpha.id);
  assert.equal(result.report.status, "passed");
  assert.equal(result.report.verified, 1);
  assert.equal(verified.lifecycle.verified, "yes");
  assert.equal(verified.metadata.observedVerification.receiptId, "fixture-pass-1");
  assert.equal(inventory.artifacts.find((artifact) => artifact.id === alpha.id).lifecycle.verified, "unknown");
});

test("stale, unmatched, failed, and unsafe receipts cannot manufacture verification", (t) => {
  const inventory = scanEnvironment({ home: fixtureHome(t), clock: CLOCK });
  const alpha = inventory.artifacts.find((artifact) => artifact.id === "plugin:alpha");
  const stale = receiptBundle(alpha);
  stale.receipts[0].artifactFingerprint = `sha256:${"0".repeat(64)}`;
  const staleResult = applyObservedReceipts(inventory, stale, { now: NOW });
  assert.equal(staleResult.report.stale, 1);
  assert.equal(staleResult.inventory.artifacts.find((artifact) => artifact.id === alpha.id).lifecycle.verified, "unknown");

  const unmatched = receiptBundle(alpha);
  unmatched.receipts[0].artifactId = "plugin:not-present";
  assert.equal(applyObservedReceipts(inventory, unmatched, { now: NOW }).report.unmatched, 1);

  const failed = receiptBundle(alpha, { outcome: "failed", receiptId: "fixture-fail-1" });
  const failedResult = applyObservedReceipts(inventory, failed, { now: NOW });
  assert.equal(failedResult.report.observedFailures, 1);
  assert.equal(failedResult.inventory.artifacts.find((artifact) => artifact.id === alpha.id).lifecycle.verified, "no");

  const unsafe = receiptBundle(alpha);
  unsafe.receipts[0].issuer = "/home/private-user/issuer";
  assert.ok(validateReceiptBundle(unsafe, { now: NOW }).some((failure) => failure.includes("unsafe")));
});

test("receipt loader and CLI validate explicit bounded files without source mutation", async (t) => {
  const home = fixtureHome(t);
  const inventory = scanEnvironment({ home, clock: CLOCK });
  const alpha = inventory.artifacts.find((artifact) => artifact.id === "plugin:alpha");
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "capability-receipts-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, "receipts.json");
  fs.writeFileSync(file, `${JSON.stringify(receiptBundle(alpha))}\n`);
  assert.equal(loadReceiptBundle(file, { now: NOW }).receipts.length, 1);

  const io = captureIo();
  assert.equal(await runCli(["receipts", "--input", file, "--home", home, "--json"], io), 0);
  const report = JSON.parse(io.stdout.join("\n"));
  assert.equal(report.verified, 1);
  assert.equal(JSON.stringify(report).includes(home), false);
  assert.equal(fs.existsSync(file), true);

  const scanIo = captureIo();
  assert.equal(await runCli(["scan", "--receipts", file, "--home", home, "--json"], scanIo), 0);
  const overlaid = JSON.parse(scanIo.stdout.join("\n"));
  assert.equal(overlaid.verification.verified, 1);
  assert.equal(overlaid.artifacts.find((artifact) => artifact.id === alpha.id).lifecycle.verified, "yes");
});

test("latest receipt wins deterministically and strict mode rejects warnings", async (t) => {
  const home = fixtureHome(t);
  const inventory = scanEnvironment({ home, clock: CLOCK });
  const alpha = inventory.artifacts.find((artifact) => artifact.id === "plugin:alpha");
  const bundle = receiptBundle(alpha);
  bundle.receipts.push({
    ...bundle.receipts[0],
    receiptId: "fixture-fail-latest",
    outcome: "failed",
    observedAt: "2026-07-16T12:00:45.000Z",
  });
  const first = applyObservedReceipts(inventory, bundle, { now: NOW });
  const second = applyObservedReceipts(inventory, bundle, { now: NOW });
  assert.deepEqual(first, second);
  assert.equal(first.report.observedFailures, 1);
  assert.equal(first.inventory.artifacts.find((artifact) => artifact.id === alpha.id).lifecycle.verified, "no");

  const stale = receiptBundle(alpha);
  stale.receipts[0].artifactFingerprint = `sha256:${"0".repeat(64)}`;
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "capability-stale-receipt-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, "stale.json");
  fs.writeFileSync(file, `${JSON.stringify(stale)}\n`);
  const io = captureIo();
  assert.equal(await runCli(["scan", "--strict", "--receipts", file, "--home", home, "--json"], io), 2);
  assert.match(io.stderr.join("\n"), /Strict receipt validation did not pass/);
});

function receiptBundle(artifact, overrides = {}) {
  return {
    schemaVersion: "1.0",
    receipts: [{
      receiptId: "fixture-pass-1",
      artifactId: artifact.id,
      artifactFingerprint: artifactFingerprint(artifact),
      contract: "capability-observation.v1",
      outcome: "passed",
      observedAt: "2026-07-16T12:00:30.000Z",
      environment: "fixture",
      issuer: "capability-intelligence-test",
      checks: CHECKS,
      ...overrides,
    }],
  };
}

function captureIo() {
  const stdout = [];
  const stderr = [];
  return { stdout, stderr, out(value) { stdout.push(String(value)); }, err(value) { stderr.push(String(value)); } };
}
