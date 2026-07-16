import { spawnSync } from "node:child_process";
import path from "node:path";
import { walkFiles } from "../src/utils.js";

const roots = ["bin", "src", "static", "scripts", "test"];
const files = roots.flatMap((root) =>
  walkFiles(path.resolve(root), (file) => file.endsWith(".js") || file.endsWith(".mjs")),
);
let failures = 0;
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) failures += 1;
}
console.log(`JavaScript syntax files checked: ${files.length}`);
if (failures) {
  console.error(`JavaScript syntax failures: ${failures}`);
  process.exitCode = 1;
}
