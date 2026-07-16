#!/usr/bin/env node
import { runCli } from "../src/cli.js";

try {
  const exitCode = await runCli(process.argv.slice(2));
  if (typeof exitCode === "number") process.exitCode = exitCode;
} catch (error) {
  console.error(`Capability Intelligence failed: ${error.message}`);
  process.exitCode = 1;
}
