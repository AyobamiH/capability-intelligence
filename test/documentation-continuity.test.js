import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

function read(relativePath) {
  return fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("agent documentation identifies current direction and its authorities", () => {
  const agents = read("AGENTS.md");
  const readme = read("README.md");
  const maturity = read("docs/MATURITY.md");
  const backlog = read("docs/BACKLOG.md");
  const contributing = read("CONTRIBUTING.md");

  assert.match(agents, /^## Agent Start Sequence$/m);
  assert.match(agents, /^## Documentation Continuity$/m);
  for (const authority of ["docs/product-contract.md", "docs/MATURITY.md", "docs/BACKLOG.md", "docs/product-decisions.md", "CHANGELOG.md"]) {
    assert.ok(agents.includes(authority), `AGENTS.md must identify ${authority}`);
  }

  assert.match(readme, /^## Agent Orientation$/m);
  assert.match(readme, /better \*\*agent decision support\*\*/);
  assert.match(maturity, /^## Current Product Direction$/m);
  assert.match(maturity, /No generic broker, autonomous invocation layer, workflow-engine integration, or multi-agent role system is active work/);
  assert.match(backlog, /^## Agent Planning Contract$/m);
  assert.match(backlog, /creates no runtime dependency, shared roadmap, or authority relationship/);
  assert.match(contributing, /^## Documentation Handoff$/m);
});
