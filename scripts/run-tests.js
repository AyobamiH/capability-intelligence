#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";

// Enumerate in Node so test discovery behaves identically on Unix and Windows.
const testDirectory = resolve("test");
const testFiles = readdirSync(testDirectory)
  .filter((file) => file.endsWith(".test.js"))
  .sort()
  .map((file) => join("test", file));

if (testFiles.length === 0) {
  console.error("No test files found in test/");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["--test", "--test-concurrency=1", ...testFiles],
  { stdio: "inherit" },
);

if (result.error) {
  console.error(`Unable to start Node test runner: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
