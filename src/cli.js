import fs from "node:fs";
import path from "node:path";
import { parseCliArgs, validateCliOptions } from "./cli-options.js";
import { scanEnvironment, redactedInventory } from "./scanner.js";
import { hostDiff, inspectArtifact, searchArtifacts } from "./query.js";
import { renderInventory, renderSearch, renderSummary } from "./render.js";
import { startServer } from "./server.js";

const HELP = `Capability Intelligence

Usage:
  capability-intelligence scan [--json] [--summary] [--strict] [--home PATH]
  capability-intelligence coverage [--json] [--home PATH]
  capability-intelligence ask <outcome> [--json] [--home PATH]
  capability-intelligence inspect <artifact-id> [--json] [--home PATH]
  capability-intelligence doctor [--json] [--home PATH]
  capability-intelligence risks [--level critical|high|medium|low|unknown] [--json] [--home PATH]
  capability-intelligence duplicates [--json] [--home PATH]
  capability-intelligence diff --host HOST --host HOST [--json] [--home PATH]
  capability-intelligence export --output PATH [--redacted] [--home PATH]
  capability-intelligence serve [--port PORT] [--home PATH]

The default scan is local, read-only, allowlisted, and makes no network request.`;

export async function runCli(argv, io = defaultIo()) {
  const { command, positional, options } = parseArgs(argv);
  if (!command || options.help || command === "help") {
    io.out(HELP);
    return 0;
  }
  const validationError = validateCliOptions(command, options);
  if (validationError) return fail(io, validationError);
  const home = options.home ? path.resolve(options.home) : undefined;

  if (command === "serve") {
    const port = parsePort(options.port);
    const server = await startServer({ home, port });
    io.out(`Capability Intelligence available at http://127.0.0.1:${server.address().port}`);
    return new Promise(() => {});
  }

  const inventory = scanEnvironment({ home });
  switch (command) {
    case "scan":
      emit(io, options.json ? inventory : options.summary ? renderSummary(inventory) : renderInventory(inventory), options.json);
      if (options.strict && inventory.coverage.status !== "passed") return fail(io, "Strict coverage failed.");
      return 0;
    case "coverage":
      emit(io, options.json ? inventory.coverage : renderCoverage(inventory), options.json);
      return inventory.coverage.status === "passed" ? 0 : 1;
    case "ask": {
      const query = positional.join(" ").trim();
      if (!query) return fail(io, "ask requires an outcome query.");
      const results = searchArtifacts(inventory, query);
      emit(io, options.json ? results : renderSearch(results, query), options.json);
      return results.length ? 0 : 2;
    }
    case "inspect": {
      if (!positional[0]) return fail(io, "inspect requires an artifact ID.");
      const result = inspectArtifact(inventory, positional[0]);
      if (!result) return fail(io, `Artifact not found: ${positional[0]}`, 2);
      emit(io, options.json ? result : renderInspection(result), options.json);
      return 0;
    }
    case "doctor": {
      const report = {
        coverage: inventory.coverage,
        sources: inventory.sources,
        findings: inventory.findings,
      };
      emit(io, options.json ? report : renderDoctor(report), options.json);
      return inventory.coverage.status === "passed" ? 0 : 1;
    }
    case "risks": {
      const level = options.level || null;
      const artifacts = inventory.artifacts.filter((artifact) => !level || artifact.risk.level === level);
      emit(io, options.json ? artifacts : renderRisks(artifacts), options.json);
      return 0;
    }
    case "duplicates":
      emit(io, options.json ? inventory.graph.duplicates : renderDuplicates(inventory.graph.duplicates), options.json);
      return 0;
    case "diff": {
      const hosts = arrayOption(options.host);
      if (hosts.length !== 2) return fail(io, "diff requires exactly two --host values.");
      const result = hostDiff(inventory, hosts[0], hosts[1]);
      emit(io, options.json ? result : renderDiff(result, hosts), options.json);
      return 0;
    }
    case "export": {
      if (!options.output || Array.isArray(options.output)) return fail(io, "export requires --output PATH.");
      const outputPath = path.resolve(options.output);
      const payload = options.redacted ? redactedInventory(inventory) : inventory;
      fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, { mode: 0o600 });
      io.out(`Wrote ${options.redacted ? "redacted " : ""}inventory to ${outputPath}`);
      return payload.coverage.status === "passed" ? 0 : 1;
    }
    default:
      return fail(io, `Unknown command: ${command}`);
  }
}

export function parseArgs(argv) {
  return parseCliArgs(argv);
}

function emit(io, value, json) {
  io.out(json ? JSON.stringify(value, null, 2) : value);
}

function fail(io, message, code = 1) {
  io.err(message);
  return code;
}

function defaultIo() {
  return { out: console.log, err: console.error };
}

function arrayOption(value) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function parsePort(value) {
  if (value === undefined) return 4317;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("Port must be an integer from 0 to 65535.");
  return port;
}

function renderCoverage(inventory) {
  const lines = [`Coverage: ${inventory.coverage.status.toUpperCase()}`];
  for (const source of inventory.sources) {
    lines.push(`${source.id}: ${source.status}; records=${source.records}; represented=${source.represented}; deduplicated=${source.deduplicated}; parse_failures=${source.parseFailures}`);
  }
  for (const failure of inventory.coverage.failures) lines.push(`FAIL: ${failure}`);
  return lines.join("\n");
}

function renderInspection(result) {
  const { artifact, incoming, outgoing } = result;
  return [
    `${artifact.name} (${artifact.id})`,
    `Type: ${artifact.type}`,
    `Source: ${artifact.source}`,
    `Capabilities: ${artifact.capabilities.join(", ") || "unknown"}`,
    `Risk: ${artifact.risk.level}${artifact.risk.reasons.length ? ` - ${artifact.risk.reasons.join(", ")}` : ""}`,
    `Lifecycle: ${Object.entries(artifact.lifecycle).map(([key, value]) => `${key}=${value}`).join(", ")}`,
    `Relationships: ${incoming.length} incoming, ${outgoing.length} outgoing`,
  ].join("\n");
}

function renderDoctor(report) {
  const lines = [`Doctor: ${report.coverage.status.toUpperCase()}`, "Sources"];
  report.sources.forEach((source) => lines.push(`  ${source.id}: ${source.status}`));
  if (report.findings.length) {
    lines.push("Findings");
    report.findings.forEach((finding) => lines.push(`  ${finding.level}: ${finding.code} (${finding.source})`));
  }
  return lines.join("\n");
}

function renderRisks(artifacts) {
  if (!artifacts.length) return "No matching risk records.";
  return artifacts.map((artifact) => `${artifact.risk.level}\t${artifact.id}\t${artifact.name}\t${artifact.risk.reasons.join(", ")}`).join("\n");
}

function renderDuplicates(duplicates) {
  if (!duplicates.length) return "No duplicate skill names detected.";
  return duplicates.map((record) => `${record.name}: ${record.artifactIds.join(", ")}`).join("\n");
}

function renderDiff(records, hosts) {
  if (!records.length) return `No capability-name differences between ${hosts[0]} and ${hosts[1]}.`;
  return records.map((record) => `${record.type}\t${record.name}\t${hosts[0]}=${record.left}\t${hosts[1]}=${record.right}`).join("\n");
}
