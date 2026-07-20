import assert from "node:assert/strict";
import test from "node:test";
import { inferCapabilities } from "../src/classify.js";

test("capability inference matches complete words and common inflections", () => {
  assert.deepEqual(inferCapabilities("Create videos and animated captions"), ["video"]);
  assert.deepEqual(inferCapabilities("Repository coding, builds, and tests"), ["code"]);
  assert.deepEqual(inferCapabilities("Meeting calendars and emails"), ["communication"]);
});

test("capability inference does not derive code from Codex", () => {
  assert.deepEqual(
    inferCapabilities("Fyxer for Codex lets you write emails from chat"),
    ["communication"],
  );
  assert.deepEqual(inferCapabilities("Bring your CRM workspace into Codex"), []);
});
