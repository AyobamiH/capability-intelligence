import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function fixtureHome(t) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "capability-intelligence-test-"));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  const pluginRoot = path.join(home, ".codex/.tmp/plugins/plugins");
  const plugins = [
    {
      name: "alpha",
      description: "Create polished product video and motion graphics.",
      interface: { displayName: "Alpha Video", capabilities: ["video creation"] },
      skills: ["./skills/shared"],
      apps: "./.app.json",
      mcpServers: "./.mcp.json",
    },
    {
      name: "beta",
      description: "Repository checks and coding evidence.",
      interface: { displayName: "Beta" },
      skills: ["./skills/shared"],
    },
    {
      name: "gamma",
      description: "Calendar planning.",
      interface: { displayName: "Gamma" },
    },
  ];
  for (const plugin of plugins) {
    writeJson(path.join(pluginRoot, plugin.name, ".codex-plugin/plugin.json"), { version: "1.0.0", ...plugin });
  }
  write(path.join(pluginRoot, "alpha/skills/shared/SKILL.md"), skill("shared", "Create product videos."));
  write(path.join(pluginRoot, "beta/skills/shared/SKILL.md"), skill("shared", "Check repositories."));
  write(path.join(pluginRoot, "alpha/scripts/render.js"), "export {};\n");
  writeJson(path.join(home, ".codex/.tmp/plugins/.agents/plugins/marketplace.json"), {
    name: "fixture",
    plugins: plugins.map((plugin) => ({ name: plugin.name })),
  });
  writeJson(path.join(home, ".codex/plugins/cache/fixture/alpha/.codex-remote-plugin-install.json"), {
    schema_version: 1,
    remote_plugin_id: "withheld",
  });
  writeJson(path.join(home, ".codex/plugins/cache/fixture/alpha/1.0.0/.codex-plugin/plugin.json"), {
    version: "1.0.0",
    ...plugins[0],
  });
  write(path.join(home, ".codex/plugins/cache/fixture/alpha/1.0.0/skills/installed/SKILL.md"), skill("installed-alpha", "Installed video helper."));
  writeJson(path.join(home, ".codex/plugins/cache/fixture/alpha/0.9.0/.codex-plugin/plugin.json"), {
    version: "0.9.0",
    ...plugins[0],
  });

  write(path.join(home, ".codex/skills/codex-only/SKILL.md"), skill("Codex only", "Codex repository helper."));
  write(path.join(home, ".agents/skills/shared/SKILL.md"), skill("shared", "Shared workflow helper."));
  write(path.join(home, ".claude/skills/claude-only/SKILL.md"), skill("Claude only", "Claude document helper."));

  writeJson(path.join(home, ".codex/cache/codex_apps_tools/tools.json"), {
    schema_version: 1,
    tools: [
      tool("list_records", "List records", { readOnlyHint: true, destructiveHint: false, openWorldHint: false }),
      tool("delete_record", "Delete record", { readOnlyHint: false, destructiveHint: true, openWorldHint: true }),
    ],
  });
  writeJson(path.join(home, ".codex/cache/codex_app_directory/one.json"), {
    schema_version: 1,
    connectors: [connector("connector-private-one", "Example CRM", true), connector("connector-private-two", "Example Docs", false)],
  });
  writeJson(path.join(home, ".codex/cache/codex_app_directory/two.json"), {
    schema_version: 1,
    connectors: [connector("connector-private-one", "Example CRM", true)],
  });

  const workflow = path.join(home, ".openclaw/skills/coding-workflow-library");
  writeJson(path.join(workflow, "package.json"), { name: "autonomous-coding-workflow-library", version: "1.0.0", description: "Workflow evidence controls." });
  write(path.join(workflow, "skill-files/build-verify-skill.md"), skill("build-verify-skill", "Verify builds and tests."));
  write(path.join(workflow, "scripts/verify"), "#!/usr/bin/env node\n");
  writeJson(path.join(workflow, "schemas/report.json"), { type: "object" });
  write(path.join(workflow, "templates/report.md"), "# Report\n");
  write(path.join(workflow, "README.md"), "# Workflow library\n");
  writeJson(path.join(workflow, "routes/skill-routes.json"), {
    routes: [{ id: "build-verify", skill_file: "skill-files/build-verify-skill.md", ledger_states_handled: ["implemented"], explicit_permission_required: false }],
  });

  writeJson(path.join(home, ".npm-global/lib/node_modules/openclaw/dist/extensions/native-model/openclaw.plugin.json"), {
    id: "native-model",
    name: "Native model provider",
    description: "Provides local model catalogue metadata.",
    enabledByDefault: true,
    providers: ["fixture-provider"],
    configSchema: { type: "object", properties: {} },
  });
  writeJson(path.join(home, ".openclaw/extensions/local-channel/openclaw.plugin.json"), {
    id: "local-channel",
    name: "Local channel",
    description: "Connects a local communication channel.",
    channels: ["fixture-channel"],
    configSchema: { type: "object", properties: {} },
  });
  writeJson(path.join(home, ".openclaw/npm/projects/codex/node_modules/@openclaw/codex/openclaw.plugin.json"), {
    id: "codex",
    name: "Codex runtime",
    description: "Runs bounded coding agent sessions.",
    commandAliases: ["codex"],
    configSchema: { type: "object", properties: {} },
  });
  return home;
}

function tool(name, title, annotations) {
  return {
    server_name: "fixture",
    tool_namespace: "fixture",
    namespace_description: "Fixture records",
    connector_id: "private",
    connector_name: "Fixture",
    tool: {
      name,
      title,
      description: `${title} in the fixture.`,
      inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
      outputSchema: { type: "object", properties: {} },
      annotations,
    },
  };
}

function connector(id, name, enabled) {
  return {
    id,
    name,
    description: `${name} connector.`,
    installUrl: `https://install.example/${id}`,
    isEnabled: enabled,
    isAccessible: enabled,
    appMetadata: { categories: ["Business"] },
  };
}

function skill(name, description) {
  return `---\nname: ${name}\ndescription: ${description}\n---\n# ${name}\n\n${description}\n`;
}

function writeJson(file, value) {
  write(file, `${JSON.stringify(value, null, 2)}\n`);
}

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
}
