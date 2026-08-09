import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { runCli, parseArgs } from "../src/cli.js";
import { scanEnvironment } from "../src/scanner.js";
import { createRequestHandler } from "../src/server.js";
import { fixtureHome } from "./helpers/fixture-home.js";

test("CLI argument parsing preserves repeated host options", () => {
  const parsed = parseArgs(["diff", "--host", "codex", "--host", "claude", "--json"]);
  assert.deepEqual(parsed.options.host, ["codex", "claude"]);
  assert.equal(parsed.options.json, true);
});

test("CLI rejects unsupported and repeated singleton options", () => {
  assert.throws(() => parseArgs(["scan", "--bogus", "value"]), /Unknown option for scan: --bogus/);
  assert.throws(() => parseArgs(["scan", "--home", "/one", "--home", "/two"]), /--home may only be provided once/);
  assert.deepEqual(parseArgs(["--help"]), { command: "help", positional: [], options: { help: true } });
});

test("CLI validates risk levels before inventory work", async (t) => {
  const invalidIo = captureIo();
  assert.equal(await runCli(["risks", "--level", "nonsense"], invalidIo), 1);
  assert.match(invalidIo.stderr.join("\n"), /critical, high, medium, low, unknown/);

  const home = fixtureHome(t);
  const validIo = captureIo();
  assert.equal(await runCli(["risks", "--level", "high", "--json", "--home", home], validIo), 0);
  const records = JSON.parse(validIo.stdout.join("\n"));
  assert.ok(records.every((artifact) => artifact.risk.level === "high"));
});

test("CLI scan, query, diff, and redacted export are functional", async (t) => {
  const home = fixtureHome(t);
  const io = captureIo();
  assert.equal(await runCli(["scan", "--strict", "--summary", "--home", home], io), 0);
  assert.match(io.stdout.join("\n"), /Coverage: PASSED/);

  const queryIo = captureIo();
  assert.equal(await runCli(["ask", "product video", "--home", home], queryIo), 0);
  assert.match(queryIo.stdout.join("\n"), /Alpha Video/);

  const noMatchIo = captureIo();
  assert.equal(await runCli(["ask", "qxvplm", "--home", home], noMatchIo), 2);
  assert.match(noMatchIo.stdout.join("\n"), /No capability matches found/);

  const recommendationIo = captureIo();
  assert.equal(await runCli(["recommend", "create a product video", "--json", "--home", home], recommendationIo), 0);
  const recommendation = JSON.parse(recommendationIo.stdout.join("\n"));
  assert.equal(recommendation.status, "candidate_found");
  assert.equal(recommendation.automaticAction, false);
  assert.equal(recommendation.recommendation.artifact.type, "skill");
  assert.match(recommendation.recommendation.artifact.description, /product videos/i);

  const broadIo = captureIo();
  assert.equal(await runCli(["recommend", "agents need tools", "--home", home], broadIo), 2);
  assert.match(broadIo.stdout.join("\n"), /OUTCOME TOO BROAD/);

  const diffIo = captureIo();
  assert.equal(await runCli(["diff", "--host", "codex", "--host", "claude", "--home", home], diffIo), 0);
  assert.match(diffIo.stdout.join("\n"), /Codex only/);

  const unlabelledIo = captureIo();
  assert.equal(await runCli(["unlabelled", "--home", home], unlabelledIo), 0);
  assert.match(unlabelledIo.stdout.join("\n"), /Unlabelled plugin manifests: 2/);
  assert.match(unlabelledIo.stdout.join("\n"), /At least one broad label inferred: 2/);
  assert.match(unlabelledIo.stdout.join("\n"), /Broad capabilities: code/);

  const unlabelledJsonIo = captureIo();
  assert.equal(await runCli(["unlabelled", "--json", "--home", home], unlabelledJsonIo), 0);
  const unlabelled = JSON.parse(unlabelledJsonIo.stdout.join("\n"));
  assert.equal(unlabelled.count, 2);
  assert.ok(unlabelled.records.every((record) => record.lifecycle.verified === "unknown"));

  const output = path.join(home, "redacted.json");
  const exportIo = captureIo();
  assert.equal(await runCli(["export", "--output", output, "--redacted", "--home", home], exportIo), 0);
  const exported = fs.readFileSync(output, "utf8");
  assert.doesNotMatch(exported, /connector-private/);
  assert.doesNotMatch(exported, new RegExp(home.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

  const refusedIo = captureIo();
  assert.equal(await runCli(["export", "--output", output, "--redacted", "--home", home], refusedIo), 3);
  assert.match(refusedIo.stderr.join("\n"), /Refusing to overwrite/);
  const forcedIo = captureIo();
  assert.equal(await runCli(["export", "--output", output, "--redacted", "--force", "--home", home], forcedIo), 0);
  if (process.platform !== "win32") assert.equal(fs.statSync(output).mode & 0o777, 0o600);
});

test("HTTP handler exposes health, inventory, coverage, and search without a socket", async (t) => {
  const home = fixtureHome(t);
  const inventory = scanEnvironment({ home, clock: () => new Date("2026-07-16T12:00:00.000Z") });
  const handler = createRequestHandler({ inventory });
  const health = invokeHandler(handler, "/health");
  const coverage = invokeHandler(handler, "/api/coverage");
  const search = invokeHandler(handler, "/api/search?q=product%20video");
  const noMatch = invokeHandler(handler, "/api/search?q=qxvplm");
  const emptySearch = invokeHandler(handler, "/api/search");
  const firstPage = invokeHandler(handler, "/api/inventory?limit=2");
  const secondPage = invokeHandler(handler, "/api/inventory?limit=2&offset=2");
  const detail = invokeHandler(handler, "/api/artifact?id=plugin%3Aalpha");
  const diagnostics = invokeHandler(handler, "/api/diagnostics");
  const diff = invokeHandler(handler, "/api/diff?left=codex&right=claude");
  assert.equal(health.status, "ok");
  assert.equal(coverage.status, "passed");
  assert.ok(search.some((result) => result.artifact.name === "Alpha Video"));
  assert.deepEqual(noMatch, []);
  assert.deepEqual(emptySearch, []);
  assert.equal(firstPage.page.items.length, 2);
  assert.equal(firstPage.page.total, inventory.artifacts.length);
  assert.equal(secondPage.page.offset, 2);
  assert.equal("artifacts" in firstPage, false);
  assert.equal(detail.artifact.name, "Alpha Video");
  assert.ok(Array.isArray(diagnostics.findings));
  assert.ok(diff.records.some((record) => record.name === "Codex only"));
  assert.equal(invokeRaw(handler, "/api/inventory?limit=500").status, 400);
  assert.equal(invokeRaw(handler, "/api/artifact").status, 400);
});

test("dashboard CSS reflows without globally hiding overflow", () => {
  const css = fs.readFileSync(new URL("../static/styles.css", import.meta.url), "utf8");
  const html = fs.readFileSync(new URL("../static/index.html", import.meta.url), "utf8");
  assert.doesNotMatch(css, /body\s*\{[^}]*overflow-x:\s*hidden/s);
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(css, /\.table-wrap \{ overflow-x: auto; \}/);
  assert.match(css, /grid-template-areas: "details" "inventory"/);
  assert.match(html, /Find an outcome or capability/);
  assert.match(html, /Evidence detail/);
  assert.match(html, /Reset filters/);
  assert.match(html, /Capability-name differences/);
  assert.doesNotMatch(html, /Complete coverage/);
});

test("package documentation allowlist excludes local reconnaissance drafts", () => {
  const packageJson = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(packageJson.files.includes("docs/"), false);
  assert.ok(packageJson.files.includes("docs/product-recon/README.md"));
  assert.ok(packageJson.files.includes("docs/product-recon/UNLABELLED_PLUGIN_MANIFEST_AUDIT.md"));
  assert.equal(packageJson.files.some((entry) => /HANDOFF|DOSSIER|OPEN_QUESTIONS|product-model/.test(entry)), false);
});

test("historical reconnaissance has explicit per-file decisions and stays outside the package", () => {
  const archiveRoot = new URL("../docs/product-recon/archive/2026-07-16-d79bcc6/", import.meta.url);
  const decisionRecord = fs.readFileSync(new URL("README.md", archiveRoot), "utf8");
  const expected = [
    "COPYWRITER_HANDOFF.md",
    "EVIDENCE_INDEX.md",
    "LOVABLE_BUILD_CONTEXT.md",
    "OPEN_QUESTIONS.md",
    "PRODUCT_DOSSIER.md",
    "UX_UI_HANDOFF.md",
    "product-model.json",
  ];
  for (const file of expected) {
    assert.ok(fs.existsSync(new URL(file, archiveRoot)), `${file} should be preserved in the archive`);
    assert.ok(decisionRecord.includes(`| \`${file}\` | Archive |`), `${file} should have an archive decision`);
  }
  const npmignore = fs.readFileSync(new URL("../.npmignore", import.meta.url), "utf8");
  assert.match(npmignore, /^docs\/product-recon\/archive\/$/m);
});

function captureIo() {
  const stdout = [];
  const stderr = [];
  return { stdout, stderr, out: (value) => stdout.push(String(value)), err: (value) => stderr.push(String(value)) };
}

function invokeHandler(handler, pathname) {
  const result = invokeRaw(handler, pathname);
  assert.equal(result.status, 200);
  return result.body;
}

function invokeRaw(handler, pathname) {
  let status;
  let body = "";
  handler(
    { method: "GET", url: pathname },
    {
      writeHead(value) { status = value; },
      end(value) { body += value || ""; },
    },
  );
  return { status, body: JSON.parse(body) };
}
