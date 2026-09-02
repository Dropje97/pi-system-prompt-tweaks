/**
 * Patch: scoped-pi-doc-reading
 *
 * Exact upstream text patched by this extension.
 *
 * Source (upstream repo): packages/coding-agent/src/core/system-prompt.ts,
 * buildSystemPrompt(). Verified against the installed build's
 * dist/core/system-prompt.js in @earendil-works/pi-coding-agent 0.84.4.
 * See upstream issue https://github.com/earendil-works/pi/issues/9014.
 */
export const PATCH_ID = "scoped-pi-doc-reading";

export const OLD_DOC_READING_TEXT =
  "- When working on pi topics, read the docs and examples, and follow .md cross-references before implementing\n" +
  "- Always read pi .md files completely and follow links to related docs (e.g., tui.md for TUI API details)";

/** Task-scoped replacement, per this repo's issue #1. */
export const NEW_DOC_READING_TEXT =
  "- When Pi documentation is relevant, first identify and read the sections needed for the current question. Follow only materially relevant cross-references. Read the full document only when broad coverage or full-context interpretation is required.";

export type DocReadingScopeStatus = "applied" | "already-upstream" | "unrecognized";

export interface DocReadingScopeResult {
  status: DocReadingScopeStatus;
  systemPrompt: string;
}

/**
 * Replaces the exhaustive-reading rule with task-scoped guidance.
 *
 * Checks the old text first so a prompt that already has the new wording
 * appended elsewhere (e.g. via APPEND_SYSTEM.md) doesn't shadow a base prompt
 * that still contains the old rule. Only ever touches an exact, known match,
 * exactly once: zero matches (of either text), or more than one match of the
 * old text, are ambiguous and left untouched (fail closed) rather than
 * guessed at.
 */
export function applyDocReadingScopePatch(systemPrompt: string): DocReadingScopeResult {
  const oldOccurrences = countOccurrences(systemPrompt, OLD_DOC_READING_TEXT);

  if (oldOccurrences === 1) {
    return {
      status: "applied",
      // Replacer as a function, not a string: a string replacer interprets
      // "$&", "$1", etc. as special patterns. NEW_DOC_READING_TEXT has none
      // today, but future patches following this same shape might.
      systemPrompt: systemPrompt.replace(OLD_DOC_READING_TEXT, () => NEW_DOC_READING_TEXT),
    };
  }

  if (oldOccurrences === 0 && systemPrompt.includes(NEW_DOC_READING_TEXT)) {
    return { status: "already-upstream", systemPrompt };
  }

  return { status: "unrecognized", systemPrompt };
}

function countOccurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}
