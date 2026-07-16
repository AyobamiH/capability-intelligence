import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const EXCLUDED_SEGMENTS = new Set([
  ".git",
  "node_modules",
  "sessions",
  "archived_sessions",
  "attachments",
  "memories",
  "logs",
  "shell_snapshots",
  "credentials",
  ".run-next",
]);

export function stableHash(value, length = 16) {
  return crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, length);
}

export function stableSort(values, selector = (value) => value) {
  return [...values].sort((left, right) =>
    String(selector(left)).localeCompare(String(selector(right)), "en"),
  );
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function pathExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export function isExcludedPath(filePath) {
  const segments = filePath.split(path.sep);
  return segments.some((segment) => EXCLUDED_SEGMENTS.has(segment) || segment === ".env");
}

export function walkFiles(root, predicate = () => true) {
  if (!pathExists(root)) return [];
  const files = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (isExcludedPath(absolute)) continue;
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile() && predicate(absolute)) files.push(absolute);
    }
  };
  visit(root);
  return stableSort(files);
}

export function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) return {};
  const end = text.indexOf("\n---", 4);
  if (end === -1) return {};
  const result = {};
  let activeList = null;
  for (const rawLine of text.slice(4, end).split("\n")) {
    const listMatch = rawLine.match(/^\s+-\s+(.+)$/);
    if (listMatch && activeList) {
      result[activeList].push(unquote(listMatch[1].trim()));
      continue;
    }
    const pair = rawLine.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;
    const [, key, rawValue] = pair;
    if (!rawValue) {
      result[key] = [];
      activeList = key;
    } else {
      result[key] = unquote(rawValue.trim());
      activeList = null;
    }
  }
  return result;
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export function safeText(value, maximum = 320) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maximum);
}

export function safeName(value, fallback = "Unnamed capability") {
  const clean = safeText(value, 120);
  return clean || fallback;
}

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "unnamed";
}

export function structuralResources(directory) {
  const resources = {};
  for (const name of ["scripts", "references", "assets", "agents", "commands", "hooks", "ui", "workflows", "schemas"]) {
    const target = path.join(directory, name);
    if (pathExists(target)) resources[name] = walkFiles(target).length;
  }
  return resources;
}

export function semanticPath(filePath, roots) {
  for (const [label, root] of Object.entries(roots)) {
    const relative = path.relative(root, filePath);
    if (relative && !relative.startsWith("..") && !path.isAbsolute(relative)) {
      return `${label}/${relative.split(path.sep).join("/")}`;
    }
    if (relative === "") return label;
  }
  return "external-source";
}

export function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function extractCapabilityLabels(value) {
  if (!Array.isArray(value)) return [];
  return unique(
    value.flatMap((entry) => {
      if (typeof entry === "string") return [safeText(entry, 120)];
      if (!entry || typeof entry !== "object") return [];
      return [entry.name, entry.label, entry.id, entry.description]
        .map((item) => safeText(item, 120))
        .filter(Boolean)
        .slice(0, 1);
    }),
  );
}

export function countSchemaFields(schema) {
  if (!schema || typeof schema !== "object") return 0;
  return Object.keys(schema.properties || {}).length;
}

export function toIso(clock) {
  return (clock ? clock() : new Date()).toISOString();
}
