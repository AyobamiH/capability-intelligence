import fs from "node:fs";
import path from "node:path";
import { createArtifact, componentRisk } from "../model.js";
import { inferCapabilities } from "../classify.js";
import { parseSkillFile } from "./skills.js";
import { readJson, safeText, slugify, stableHash, walkFiles } from "../utils.js";

export function scanWorkflowLibrary(config) {
  const root = config.workflowLibraryRoot;
  if (!fs.existsSync(root)) return empty("coding-workflow-library");
  const artifacts = [];
  const findings = [];
  const edges = [];
  let records = 0;
  let parseFailures = 0;

  const providerId = "provider:coding-workflow-library";
  let packageData = {};
  try {
    packageData = readJson(path.join(root, "package.json"));
  } catch {
    findings.push({
      level: "error",
      code: "workflow_library_package_parse_failed",
      source: "coding-workflow-library",
      message: "The workflow library package identity could not be parsed safely.",
    });
    parseFailures += 1;
  }
  artifacts.push(
    createArtifact({
      id: providerId,
      type: "resource-provider",
      name: "Autonomous Coding Workflow Library",
      description: packageData.description || "Local workflow controls and specialist engineering skills.",
      source: "coding-workflow-library",
      hosts: ["local-cli"],
      capabilities: ["workflow", "coding"],
      classificationEvidence: "structural",
      lifecycle: {
        discovered: "yes",
        present: "yes",
        installed: "yes",
        enabled: "unknown",
        authenticated: "not_applicable",
        runnable: "unknown",
        verified: "unknown",
      },
      risk: { level: "medium", reasons: ["workflow helpers can invoke engineering actions under separate authority"] },
      metadata: { version: safeText(packageData.version, 40) || null },
    }),
  );
  records += 1;

  for (const file of walkFiles(path.join(root, "skill-files"), (item) => item.endsWith(".md"))) {
    records += 1;
    try {
      const relative = path.relative(root, file).split(path.sep).join("/");
      const skill = parseSkillFile(file, {
        sourceKey: "coding-workflow-library",
        pathKey: slugify(relative),
        source: "coding-workflow-library",
        hosts: ["local-cli", "codex", "openclaw"],
        installed: true,
        relativeLocation: relative,
      });
      artifacts.push(skill);
      edges.push({ from: providerId, to: skill.id, type: "provides" });
    } catch {
      parseFailures += 1;
      findings.push({
        level: "error",
        code: "workflow_skill_parse_failed",
        source: "coding-workflow-library",
        message: "A workflow-library skill could not be parsed safely.",
      });
    }
  }

  addFiles("scripts", "helper-script", componentRisk("helper-script"));
  addFiles("bin", "command", componentRisk("command"));
  addFiles("schemas", "schema", { level: "low", reasons: [] });
  addFiles("templates", "template", { level: "low", reasons: [] });
  addFiles("docs", "documentation-control", { level: "low", reasons: [] });

  const controlFiles = [
    "AGENTS.md",
    "README.md",
    "RUNBOOK.md",
    "build-queue.md",
    "command-library.md",
    "evidence-checklist.md",
    "skills-index.md",
    "tools.md",
    "work-ledger.md",
  ];
  for (const name of controlFiles) {
    const file = path.join(root, name);
    if (!fs.existsSync(file)) continue;
    records += 1;
    addResource(file, "documentation-control", { level: "low", reasons: [] });
  }

  const routeFile = path.join(root, "routes", "skill-routes.json");
  if (fs.existsSync(routeFile)) {
    try {
      const data = readJson(routeFile);
      for (const route of data.routes || []) {
        records += 1;
        const id = `workflow-route:${slugify(route.id)}`;
        artifacts.push(
          createArtifact({
            id,
            type: "workflow-route",
            name: route.id,
            description: `Workflow route delegated to ${safeText(route.skill_file, 120) || "a specialist skill"}.`,
            source: "coding-workflow-library",
            hosts: ["local-cli"],
            capabilities: inferCapabilities(route.id, route.skill_file, ...(route.ledger_states_handled || [])),
            classificationEvidence: "structural",
            lifecycle: {
              discovered: "yes",
              present: "yes",
              installed: "yes",
              enabled: "unknown",
              authenticated: "not_applicable",
              runnable: "unknown",
              verified: "unknown",
            },
            risk: { level: route.explicit_permission_required ? "medium" : "low", reasons: route.explicit_permission_required ? ["route requires explicit authority"] : [] },
            metadata: {
              permissionLevel: safeText(route.permission_level, 60) || null,
              explicitPermissionRequired: route.explicit_permission_required === true,
              evidenceRequiredCount: Array.isArray(route.evidence_required) ? route.evidence_required.length : 0,
            },
          }),
        );
        edges.push({ from: providerId, to: id, type: "provides" });
      }
    } catch {
      parseFailures += 1;
      findings.push({
        level: "error",
        code: "workflow_routes_parse_failed",
        source: "coding-workflow-library",
        message: "Workflow routes could not be parsed safely.",
      });
    }
  }

  return {
    artifacts,
    edges,
    findings,
    sources: [
      {
        id: "coding-workflow-library",
        status: "available",
        records,
        represented: artifacts.length,
        deduplicated: 0,
        parseFailures,
      },
    ],
  };

  function addFiles(directoryName, type, risk) {
    for (const file of walkFiles(path.join(root, directoryName))) {
      records += 1;
      addResource(file, type, risk);
    }
  }

  function addResource(file, type, risk) {
    const relative = path.relative(root, file).split(path.sep).join("/");
    const id = `${type}:workflow-library:${stableHash(relative)}`;
    artifacts.push(
      createArtifact({
        id,
        type,
        name: path.basename(file, path.extname(file)).replace(/[-_]+/g, " "),
        description: `${type} from the autonomous coding workflow library.`,
        source: "coding-workflow-library",
        hosts: ["local-cli"],
        capabilities: inferCapabilities(relative),
        classificationEvidence: "structural",
        lifecycle: {
          discovered: "yes",
          present: "yes",
          installed: "yes",
          enabled: "unknown",
          authenticated: "not_applicable",
          runnable: type === "helper-script" ? "unknown" : "not_applicable",
          verified: "unknown",
        },
        risk,
        metadata: { relativeLocation: relative },
      }),
    );
    edges.push({ from: providerId, to: id, type: "provides" });
  }
}

function empty(id) {
  return {
    artifacts: [],
    edges: [],
    findings: [],
    sources: [{ id, status: "absent", records: 0, represented: 0, deduplicated: 0, parseFailures: 0 }],
  };
}
