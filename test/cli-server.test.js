import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import test from "node:test";
import { runCli, parseArgs } from "../src/cli.js";
import { scanEnvironment } from "../src/scanner.js";
import { startServer } from "../src/server.js";
import { fixtureHome } from "./helpers/fixture-home.js";

test("CLI argument parsing preserves repeated host options", () => {
  const parsed = parseArgs(["diff", "--host", "codex", "--host", "claude", "--json"]);
  assert.deepEqual(parsed.options.host, ["codex", "claude"]);
  assert.equal(parsed.options.json, true);
});

test("CLI scan, query, diff, and redacted export are functional", async (t) => {
  const home = fixtureHome(t);
  const io = captureIo();
  assert.equal(await runCli(["scan", "--strict", "--summary", "--home", home], io), 0);
  assert.match(io.stdout.join("\n"), /Coverage: PASSED/);

  const queryIo = captureIo();
  assert.equal(await runCli(["ask", "product video", "--home", home], queryIo), 0);
  assert.match(queryIo.stdout.join("\n"), /Alpha Video/);

  const diffIo = captureIo();
  assert.equal(await runCli(["diff", "--host", "codex", "--host", "claude", "--home", home], diffIo), 0);
  assert.match(diffIo.stdout.join("\n"), /Codex only/);

  const output = path.join(home, "redacted.json");
  const exportIo = captureIo();
  assert.equal(await runCli(["export", "--output", output, "--redacted", "--home", home], exportIo), 0);
  const exported = fs.readFileSync(output, "utf8");
  assert.doesNotMatch(exported, /connector-private/);
  assert.doesNotMatch(exported, new RegExp(home.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("local HTTP API exposes health, inventory, coverage, and search", async (t) => {
  const home = fixtureHome(t);
  const inventory = scanEnvironment({ home, clock: () => new Date("2026-07-16T12:00:00.000Z") });
  const server = await startServer({ inventory, port: 0 });
  t.after(() => server.close());
  const port = server.address().port;
  const health = await getJson(port, "/health");
  const coverage = await getJson(port, "/api/coverage");
  const search = await getJson(port, "/api/search?q=product%20video");
  const full = await getJson(port, "/api/inventory");
  assert.equal(health.status, "ok");
  assert.equal(coverage.status, "passed");
  assert.ok(search.some((result) => result.artifact.name === "Alpha Video"));
  assert.equal(full.artifacts.length, inventory.artifacts.length);
});

test("dashboard CSS reflows without globally hiding overflow", () => {
  const css = fs.readFileSync(new URL("../static/styles.css", import.meta.url), "utf8");
  const html = fs.readFileSync(new URL("../static/index.html", import.meta.url), "utf8");
  assert.doesNotMatch(css, /body\s*\{[^}]*overflow-x:\s*hidden/s);
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(css, /\.table-wrap \{ overflow-x: auto; \}/);
  assert.match(html, /Find an outcome or capability/);
  assert.match(html, /Evidence detail/);
});

function captureIo() {
  const stdout = [];
  const stderr = [];
  return { stdout, stderr, out: (value) => stdout.push(String(value)), err: (value) => stderr.push(String(value)) };
}

function getJson(port, pathname) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: "127.0.0.1", port, path: pathname }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => {
        try { resolve(JSON.parse(body)); } catch (error) { reject(error); }
      });
    }).on("error", reject);
  });
}
