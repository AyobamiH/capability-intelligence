import fs from "node:fs";
import path from "node:path";
import { createArtifact } from "../model.js";
import { inferCapabilities } from "../classify.js";
import { readJson, safeText, stableHash, walkFiles } from "../utils.js";

export function scanConnectors(config) {
  const root = path.join(config.codexRoot, "cache", "codex_app_directory");
  if (!fs.existsSync(root)) return empty("codex-app-directory");
  const files = walkFiles(root, (file) => file.endsWith(".json"));
  const byIdentity = new Map();
  const findings = [];
  let records = 0;
  let parseFailures = 0;

  for (const file of files) {
    try {
      const data = readJson(file);
      if (!Array.isArray(data.connectors)) throw new Error("connectors array missing");
      records += data.connectors.length;
      for (const connector of data.connectors) {
        if (!connector.id) {
          findings.push({
            level: "warning",
            code: "connector_identity_missing",
            source: "codex-app-directory",
            message: "A connector record lacked a stable identity and was not represented.",
          });
          continue;
        }
        const identity = String(connector.id);
        const existing = byIdentity.get(identity);
        if (!existing || connectorScore(connector) > connectorScore(existing)) {
          byIdentity.set(identity, connector);
        }
      }
    } catch {
      parseFailures += 1;
      findings.push({
        level: "error",
        code: "connector_cache_parse_failed",
        source: "codex-app-directory",
        message: "An app-directory cache file could not be parsed safely.",
      });
    }
  }

  const artifacts = [...byIdentity.entries()].map(([identity, connector]) => {
    const capabilities = inferCapabilities(
      connector.name,
      connector.description,
      connector.appMetadata?.seoDescription,
      ...(connector.appMetadata?.categories || []),
      ...(connector.appMetadata?.subCategories || []),
    );
    return createArtifact({
      id: `connector:${stableHash(identity)}`,
      type: "connector",
      name: connector.name,
      description: connector.description || connector.appMetadata?.seoDescription,
      source: "codex-app-directory",
      hosts: ["codex"],
      capabilities,
      classificationEvidence: capabilities.length ? "inferred" : "declared",
      lifecycle: {
        discovered: "yes",
        present: "yes",
        installed: "unknown",
        enabled: "unknown",
        authenticated: "unknown",
        runnable: "unknown",
        verified: "unknown",
      },
      risk: { level: "unknown", reasons: ["connector tool authority is not available in directory metadata"] },
      metadata: {
        accessibleHint: booleanState(connector.isAccessible),
        enabledHint: booleanState(connector.isEnabled),
        distributionChannel: safeText(connector.distributionChannel, 80) || null,
        categories: Array.isArray(connector.appMetadata?.categories)
          ? connector.appMetadata.categories.map((value) => safeText(value, 80)).filter(Boolean)
          : [],
        pluginDisplayNames: Array.isArray(connector.pluginDisplayNames)
          ? connector.pluginDisplayNames.map((value) => safeText(value, 100)).filter(Boolean)
          : [],
      },
    });
  });

  const missingIdentity = findings.filter((finding) => finding.code === "connector_identity_missing").length;
  return {
    artifacts,
    edges: [],
    findings,
    sources: [
      {
        id: "codex-app-directory",
        status: "available",
        records,
        represented: artifacts.length,
        deduplicated: records - artifacts.length - missingIdentity,
        parseFailures,
        metadata: { files: files.length, recordsWithoutIdentity: missingIdentity },
      },
    ],
  };
}

function connectorScore(connector) {
  return [connector.name, connector.description, connector.isEnabled, connector.isAccessible]
    .filter((value) => value !== null && value !== undefined && value !== "")
    .length;
}

function booleanState(value) {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "unknown";
}

function empty(id) {
  return {
    artifacts: [],
    edges: [],
    findings: [],
    sources: [{ id, status: "absent", records: 0, represented: 0, deduplicated: 0, parseFailures: 0 }],
  };
}
