import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RISK_LEVELS } from "./model.js";
import { scanEnvironment } from "./scanner.js";
import { hostDiff, inspectArtifact, inventoryHosts, queryArtifactPage, searchArtifacts } from "./query.js";

const STATIC_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "static");
const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

export async function startServer(options = {}) {
  const inventory = options.inventory || scanEnvironment({ home: options.home });
  const server = http.createServer(createRequestHandler({ inventory }));
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port ?? 4317, "127.0.0.1", resolve);
  });
  return server;
}

export function createRequestHandler({ inventory }) {
  return (request, response) => {
    const url = new URL(request.url, "http://127.0.0.1");
    if (request.method !== "GET") return sendJson(response, 405, { error: "method_not_allowed" });
    if (url.pathname === "/health") return sendJson(response, 200, { status: "ok", coverage: inventory.coverage.status });
    if (url.pathname === "/api/inventory") {
      const error = validatePageRequest(url, inventory);
      if (error) return sendJson(response, 400, { error: "invalid_request", message: error });
      const page = queryArtifactPage(inventory, pageOptions(url));
      return sendJson(response, 200, inventoryProjection(inventory, page));
    }
    if (url.pathname === "/api/coverage") return sendJson(response, 200, inventory.coverage);
    if (url.pathname === "/api/diagnostics") {
      return sendJson(response, 200, { findings: inventory.findings, duplicates: inventory.graph.duplicates });
    }
    if (url.pathname === "/api/artifact") {
      const id = url.searchParams.get("id") || "";
      if (!id) return sendJson(response, 400, { error: "invalid_request", message: "id is required" });
      const result = inspectArtifact(inventory, id);
      return result ? sendJson(response, 200, result) : sendJson(response, 404, { error: "not_found" });
    }
    if (url.pathname === "/api/diff") {
      const left = url.searchParams.get("left") || "";
      const right = url.searchParams.get("right") || "";
      const hosts = inventoryHosts(inventory);
      if (!left || !right || left === right || !hosts.includes(left) || !hosts.includes(right)) {
        return sendJson(response, 400, { error: "invalid_request", message: "two different known hosts are required" });
      }
      return sendJson(response, 200, { left, right, records: hostDiff(inventory, left, right) });
    }
    if (url.pathname === "/api/search") {
      const limit = integerParameter(url, "limit", 20);
      if (limit === null || limit < 1 || limit > 200) return sendJson(response, 400, { error: "invalid_request", message: "limit must be from 1 to 200" });
      return sendJson(response, 200, searchArtifacts(inventory, url.searchParams.get("q") || "", limit));
    }
    return serveStatic(url.pathname, response);
  };
}

function inventoryProjection(inventory, page) {
  return {
    schemaVersion: inventory.schemaVersion,
    generatedAt: inventory.generatedAt,
    mode: inventory.mode,
    summary: inventory.summary,
    coverage: inventory.coverage,
    sources: inventory.sources,
    hosts: inventoryHosts(inventory),
    diagnostics: {
      findingCount: inventory.findings.length,
      duplicateCount: inventory.graph.duplicates.length,
    },
    page,
  };
}

function pageOptions(url) {
  return {
    query: url.searchParams.get("q") || "",
    type: url.searchParams.get("type") || "",
    risk: url.searchParams.get("risk") || "",
    offset: integerParameter(url, "offset", 0),
    limit: integerParameter(url, "limit", 50),
  };
}

function validatePageRequest(url, inventory) {
  const offset = integerParameter(url, "offset", 0);
  const limit = integerParameter(url, "limit", 50);
  const risk = url.searchParams.get("risk") || "";
  const type = url.searchParams.get("type") || "";
  if (offset === null || offset < 0) return "offset must be a non-negative integer";
  if (limit === null || limit < 1 || limit > 200) return "limit must be from 1 to 200";
  if (risk && !RISK_LEVELS.includes(risk)) return "risk is not recognised";
  if (type && !Object.hasOwn(inventory.summary.byType, type)) return "type is not recognised";
  return null;
}

function integerParameter(url, name, fallback) {
  const value = url.searchParams.get(name);
  if (value === null || value === "") return fallback;
  if (!/^-?\d+$/.test(value)) return null;
  return Number(value);
}

function serveStatic(urlPath, response) {
  const relative = urlPath === "/" ? "index.html" : urlPath.replace(/^\//, "");
  const filePath = path.resolve(STATIC_ROOT, relative);
  if (!filePath.startsWith(`${STATIC_ROOT}${path.sep}`) && filePath !== path.join(STATIC_ROOT, "index.html")) {
    return sendJson(response, 404, { error: "not_found" });
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return sendJson(response, 404, { error: "not_found" });
  response.writeHead(200, { "content-type": CONTENT_TYPES[path.extname(filePath)] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(response);
}

function sendJson(response, status, value) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(`${JSON.stringify(value)}\n`);
}
