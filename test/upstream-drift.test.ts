import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { OLD_DOC_READING_TEXT } from "../src/scoped-pi-doc-reading.ts";

// The package's "exports" map only exposes ".", "./client", and
// "./rpc-entry" — buildSystemPrompt() isn't importable, so this reads the
// built file as text instead.
const installedSystemPromptPath = fileURLToPath(
  new URL(
    "../node_modules/@earendil-works/pi-coding-agent/dist/core/system-prompt.js",
    import.meta.url,
  ),
);

describe("upstream drift canary", () => {
  it("still contains OLD_DOC_READING_TEXT exactly once in the installed Pi build", () => {
    const installedSource = readFileSync(installedSystemPromptPath, "utf8");
    const occurrences = installedSource.split(OLD_DOC_READING_TEXT).length - 1;

    expect(occurrences).toBe(1);
  });
});
