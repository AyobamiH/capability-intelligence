import fs from "node:fs";
import path from "node:path";
import { createArtifact, componentRisk } from "../model.js";
import {
  parseFrontmatter,
  safeText,
  slugify,
  structuralResources,
  walkFiles,
} from "../utils.js";
import { inferCapabilities } from "../classify.js";

export function parseSkillFile(filePath, context) {
  const text = fs.readFileSync(filePath, "utf8");
  const frontmatter = parseFrontmatter(text);
  const directory = path.dirname(filePath);
  const fallbackName = path.basename(directory);
  const name = frontmatter.name || fallbackName;
  const description = frontmatter.description || firstParagraph(text);
  const resources = structuralResources(directory);
  const capabilities = inferCapabilities(name, description, frontmatter.category);
  return createArtifact({
    id: `skill:${context.sourceKey}:${slugify(name)}:${context.pathKey}`,
    type: "skill",
    name,
    description,
    source: context.source,
    hosts: context.hosts,
    capabilities,
    classificationEvidence: capabilities.length ? "inferred" : "structural",
    lifecycle: {
      discovered: "yes",
      present: "yes",
      installed: context.installed ? "yes" : "unknown",
      enabled: "unknown",
      authenticated: "unknown",
      runnable: Object.keys(resources).length ? "unknown" : "unknown",
      verified: "unknown",
    },
    risk: Object.keys(resources).includes("scripts")
      ? componentRisk("helper-script")
      : { level: "low", reasons: [] },
    metadata: {
      category: safeText(frontmatter.category, 80) || null,
      status: safeText(frontmatter.status, 40) || null,
      resources,
      relativeLocation: context.relativeLocation,
    },
  });
}

export function scanSkillRoots(config) {
  const artifacts = [];
  const findings = [];
  const sources = [];
  for (const root of config.skillRoots) {
    if (!fs.existsSync(root.path)) {
      sources.push(sourceResult(root.id, "absent", 0, 0, 0));
      continue;
    }
    const files = walkFiles(root.path, (file) => path.basename(file) === "SKILL.md");
    let represented = 0;
    let parseFailures = 0;
    for (const file of files) {
      try {
        const relative = path.relative(root.path, file).split(path.sep).join("/");
        artifacts.push(
          parseSkillFile(file, {
            sourceKey: root.id,
            pathKey: slugify(relative),
            source: root.id,
            hosts: root.hosts,
            installed: true,
            relativeLocation: `${root.label}/${relative}`,
          }),
        );
        represented += 1;
      } catch {
        parseFailures += 1;
        findings.push({
          level: "error",
          code: "skill_parse_failed",
          source: root.id,
          message: "A discovered skill could not be parsed safely.",
        });
      }
    }
    sources.push(sourceResult(root.id, "available", files.length, represented, parseFailures));
  }
  return { artifacts, findings, sources, edges: [] };
}

function sourceResult(id, status, records, represented, parseFailures) {
  return { id, status, records, represented, deduplicated: 0, parseFailures };
}

function firstParagraph(text) {
  const body = text.replace(/^---[\s\S]*?---/, "");
  const paragraph = body
    .split(/\n\s*\n/)
    .map((part) => part.replace(/^#+\s+.*$/gm, "").trim())
    .find(Boolean);
  return safeText(paragraph, 320);
}
