import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scanEnvironment } from "./scanner.js";
import { searchArtifacts } from "./query.js";

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
    if (url.pathname === "/api/inventory") return sendJson(response, 200, inventory);
    if (url.pathname === "/api/coverage") return sendJson(response, 200, inventory.coverage);
    if (url.pathname === "/api/search") {
      return sendJson(response, 200, searchArtifacts(inventory, url.searchParams.get("q") || ""));
    }
    return serveStatic(url.pathname, response);
  };
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
