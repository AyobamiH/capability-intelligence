import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { findUnsafeOutput } from "./scanner.js";

const CONTRACT = "capability-observation.v1";
const MAX_RECEIPT_BYTES = 1024 * 1024;
const MAX_RECEIPTS = 1000;
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;
const REQUIRED_PASS_CHECKS = new Set([
  "artifact_identity_matched",
  "invocation_completed",
  "expected_outcome_observed",
  "no_secret_output",
]);
const CHECKS = new Set([
  ...REQUIRED_PASS_CHECKS,
  "result_persisted",
]);
const ENVIRONMENTS = new Set(["fixture", "local", "staging", "production"]);
const OUTCOMES = new Set(["passed", "failed"]);

export function artifactFingerprint(artifact) {
  const subject = {
    id: artifact.id,
    type: artifact.type,
    source: artifact.source,
    name: artifact.name,
    hosts: [...artifact.hosts].sort(),
    capabilities: [...artifact.capabilities].sort(),
  };
  return `sha256:${crypto.createHash("sha256").update(JSON.stringify(subject)).digest("hex")}`;
}

export function loadReceiptBundle(inputPath, options = {}) {
  const resolved = path.resolve(inputPath);
  const label = path.basename(resolved);
  let stat;
  try {
    stat = fs.statSync(resolved);
  } catch {
    throw new Error(`Receipt file is not readable: ${label}`);
  }
  if (!stat.isFile()) throw new Error(`Receipt input is not a regular file: ${label}`);
  if (stat.size > MAX_RECEIPT_BYTES) throw new Error(`Receipt file exceeds the ${MAX_RECEIPT_BYTES}-byte limit: ${label}`);

  let bundle;
  try {
    bundle = JSON.parse(fs.readFileSync(resolved, "utf8"));
  } catch {
    throw new Error(`Receipt file is not valid JSON: ${label}`);
  }
  const failures = validateReceiptBundle(bundle, options);
  if (failures.length) throw new Error(`Receipt validation failed: ${failures.join("; ")}`);
  return bundle;
}

export function validateReceiptBundle(bundle, options = {}) {
  const failures = [];
  if (!isObject(bundle)) return ["bundle must be an object"];
  if (bundle.schemaVersion !== "1.0") failures.push("schemaVersion must equal 1.0");
  if (!Array.isArray(bundle.receipts) || bundle.receipts.length < 1 || bundle.receipts.length > MAX_RECEIPTS) {
    failures.push(`receipts must contain from 1 to ${MAX_RECEIPTS} records`);
    return failures;
  }

  const receiptIds = new Set();
  const now = new Date(options.now || Date.now()).getTime();
  bundle.receipts.forEach((receipt, index) => {
    const at = `receipts[${index}]`;
    if (!isObject(receipt)) return failures.push(`${at} must be an object`);
    if (!safeId(receipt.receiptId)) failures.push(`${at}.receiptId is invalid`);
    if (receiptIds.has(receipt.receiptId)) failures.push(`${at}.receiptId is duplicated`);
    receiptIds.add(receipt.receiptId);
    if (!safeArtifactId(receipt.artifactId)) failures.push(`${at}.artifactId is invalid`);
    if (receipt.contract !== CONTRACT) failures.push(`${at}.contract must equal ${CONTRACT}`);
    if (!OUTCOMES.has(receipt.outcome)) failures.push(`${at}.outcome is invalid`);
    if (!ENVIRONMENTS.has(receipt.environment)) failures.push(`${at}.environment is invalid`);
    if (!safeIssuer(receipt.issuer)) failures.push(`${at}.issuer is invalid`);
    if (!/^sha256:[a-f0-9]{64}$/.test(receipt.artifactFingerprint || "")) failures.push(`${at}.artifactFingerprint is invalid`);
    const observedAt = Date.parse(receipt.observedAt);
    if (!Number.isFinite(observedAt) || new Date(observedAt).toISOString() !== receipt.observedAt) {
      failures.push(`${at}.observedAt must be an ISO date-time`);
    } else if (observedAt > now + FUTURE_TOLERANCE_MS) {
      failures.push(`${at}.observedAt is too far in the future`);
    }
    if (!Array.isArray(receipt.checks) || receipt.checks.length < 1 || receipt.checks.length > 20) {
      failures.push(`${at}.checks must contain from 1 to 20 records`);
    } else {
      if (new Set(receipt.checks).size !== receipt.checks.length) failures.push(`${at}.checks must be unique`);
      for (const check of receipt.checks) if (!CHECKS.has(check)) failures.push(`${at}.checks contains an unsupported check`);
      if (receipt.outcome === "passed") {
        for (const required of REQUIRED_PASS_CHECKS) {
          if (!receipt.checks.includes(required)) failures.push(`${at}.checks is missing ${required}`);
        }
      }
    }
    const allowed = new Set(["receiptId", "artifactId", "artifactFingerprint", "contract", "outcome", "observedAt", "environment", "issuer", "checks"]);
    for (const key of Object.keys(receipt)) if (!allowed.has(key)) failures.push(`${at}.${key} is not allowed`);
  });

  for (const unsafe of findUnsafeOutput(bundle)) failures.push(`unsafe receipt data: ${unsafe}`);
  return [...new Set(failures)].sort();
}

export function applyObservedReceipts(inventory, bundle, options = {}) {
  const failures = validateReceiptBundle(bundle, options);
  if (failures.length) return { inventory, report: failedReport(failures) };

  const copy = structuredClone(inventory);
  const artifacts = new Map(copy.artifacts.map((artifact) => [artifact.id, artifact]));
  const latest = new Map();
  for (const receipt of bundle.receipts) {
    const prior = latest.get(receipt.artifactId);
    if (!prior || receipt.observedAt > prior.observedAt) latest.set(receipt.artifactId, receipt);
  }

  const records = [];
  for (const receipt of [...latest.values()].sort((left, right) => left.artifactId.localeCompare(right.artifactId))) {
    const artifact = artifacts.get(receipt.artifactId);
    if (!artifact) {
      records.push(reportRecord(receipt, "unmatched", "artifact is not present in the current inventory"));
      continue;
    }
    if (artifactFingerprint(artifact) !== receipt.artifactFingerprint) {
      records.push(reportRecord(receipt, "stale", "artifact fingerprint does not match the current inventory"));
      continue;
    }

    artifact.lifecycle.verified = receipt.outcome === "passed" ? "yes" : "no";
    artifact.metadata.observedVerification = {
      receiptId: receipt.receiptId,
      contract: receipt.contract,
      outcome: receipt.outcome,
      observedAt: receipt.observedAt,
      environment: receipt.environment,
      issuer: receipt.issuer,
    };
    records.push(reportRecord(receipt, receipt.outcome === "passed" ? "verified" : "observed-failure", "latest matching observation applied"));
  }

  copy.summary.lifecycleYes.verified = copy.artifacts.filter((artifact) => artifact.lifecycle.verified === "yes").length;
  const report = {
    status: records.some((record) => ["unmatched", "stale"].includes(record.status)) ? "warning" : "passed",
    contract: CONTRACT,
    supplied: bundle.receipts.length,
    latest: latest.size,
    verified: records.filter((record) => record.status === "verified").length,
    observedFailures: records.filter((record) => record.status === "observed-failure").length,
    unmatched: records.filter((record) => record.status === "unmatched").length,
    stale: records.filter((record) => record.status === "stale").length,
    invalid: 0,
    records,
  };
  copy.verification = report;
  return { inventory: copy, report };
}

export function renderReceiptReport(report) {
  const lines = [
    `Observed receipts: ${report.status.toUpperCase()}`,
    `Contract: ${report.contract}`,
    `Supplied: ${report.supplied}; latest=${report.latest}; verified=${report.verified}; observed_failures=${report.observedFailures}; unmatched=${report.unmatched}; stale=${report.stale}; invalid=${report.invalid}`,
  ];
  for (const record of report.records || []) lines.push(`${record.status}\t${record.artifactId}\t${record.receiptId}\t${record.reason}`);
  for (const failure of report.failures || []) lines.push(`FAIL: ${failure}`);
  return lines.join("\n");
}

function reportRecord(receipt, status, reason) {
  return { receiptId: receipt.receiptId, artifactId: receipt.artifactId, observedAt: receipt.observedAt, outcome: receipt.outcome, status, reason };
}

function failedReport(failures) {
  return { status: "failed", contract: CONTRACT, supplied: 0, latest: 0, verified: 0, observedFailures: 0, unmatched: 0, stale: 0, invalid: failures.length, records: [], failures };
}

function safeId(value) {
  return typeof value === "string" && /^[A-Za-z0-9._:-]{1,128}$/.test(value);
}

function safeArtifactId(value) {
  return typeof value === "string" && value.length <= 240 && !value.startsWith("/") && !value.includes("..") && /^[A-Za-z0-9._:/@-]+$/.test(value);
}

function safeIssuer(value) {
  return typeof value === "string" && /^[A-Za-z0-9._:@ -]{1,120}$/.test(value);
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
