import fs from "node:fs";
import path from "node:path";
import { createArtifact, toolRisk } from "../model.js";
import { inferCapabilities } from "../classify.js";
import { countSchemaFields, readJson, safeText, slugify, stableHash, walkFiles } from "../utils.js";

export function scanAppTools(config) {
  const root = path.join(config.codexRoot, "cache", "codex_apps_tools");
  if (!fs.existsSync(root)) return empty("codex-app-tools");
  const artifacts = [];
  const findings = [];
  const files = walkFiles(root, (file) => file.endsWith(".json"));
  const seen = new Set();
  let records = 0;
  let deduplicated = 0;
  let parseFailures = 0;

  for (const file of files) {
    try {
      const data = readJson(file);
      if (!Array.isArray(data.tools)) throw new Error("tools array missing");
      records += data.tools.length;
      for (const record of data.tools) {
        const tool = record.tool || {};
        const namespace = safeText(record.tool_namespace || record.server_name || "app", 80);
        const toolName = safeText(tool.name || record.tool_name, 120);
        const identity = `${namespace}:${toolName}`;
        if (seen.has(identity)) {
          deduplicated += 1;
          continue;
        }
        seen.add(identity);
        const annotations = {
          readOnlyHint: tool.annotations?.readOnlyHint === true,
          destructiveHint: tool.annotations?.destructiveHint === true,
          openWorldHint: tool.annotations?.openWorldHint === true,
        };
        const capabilities = inferCapabilities(
          toolName,
          tool.title,
          tool.description,
          record.namespace_description,
          record.connector_name,
        );
        artifacts.push(
          createArtifact({
            id: `app-tool:${slugify(namespace)}:${slugify(toolName)}:${stableHash(identity, 8)}`,
            type: "app-tool",
            name: tool.title || toolName,
            description: tool.description || record.namespace_description,
            source: "codex-app-tools",
            hosts: ["codex"],
            capabilities,
            classificationEvidence: "declared",
            lifecycle: {
              discovered: "yes",
              present: "yes",
              installed: "unknown",
              enabled: "unknown",
              authenticated: "unknown",
              runnable: "unknown",
              verified: "unknown",
            },
            risk: toolRisk(annotations),
            metadata: {
              namespace,
              connectorName: safeText(record.connector_name, 100) || null,
              pluginDisplayNames: Array.isArray(record.plugin_display_names)
                ? record.plugin_display_names.map((name) => safeText(name, 100)).filter(Boolean)
                : [],
              supportsParallelCalls: record.supports_parallel_tool_calls === true,
              annotations,
              inputFieldCount: countSchemaFields(tool.inputSchema),
              requiredInputCount: Array.isArray(tool.inputSchema?.required)
                ? tool.inputSchema.required.length
                : 0,
              hasOutputSchema: Boolean(tool.outputSchema),
            },
          }),
        );
      }
    } catch {
      parseFailures += 1;
      findings.push({
        level: "error",
        code: "app_tool_cache_parse_failed",
        source: "codex-app-tools",
        message: "An app-tool cache file could not be parsed safely.",
      });
    }
  }

  return {
    artifacts,
    edges: [],
    findings,
    sources: [
      {
        id: "codex-app-tools",
        status: "available",
        records,
        represented: artifacts.length,
        deduplicated,
        parseFailures,
        metadata: { files: files.length },
      },
    ],
  };
}

function empty(id) {
  return {
    artifacts: [],
    edges: [],
    findings: [],
    sources: [{ id, status: "absent", records: 0, represented: 0, deduplicated: 0, parseFailures: 0 }],
  };
}
