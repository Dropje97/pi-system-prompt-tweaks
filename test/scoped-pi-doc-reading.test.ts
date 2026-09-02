import { describe, expect, it } from "vitest";
import { applyDocReadingScopePatch, NEW_DOC_READING_TEXT, OLD_DOC_READING_TEXT } from "../src/scoped-pi-doc-reading.ts";

const PROMPT_PREFIX = "You are an expert coding assistant operating inside pi.\n\nPi documentation:\n";
const PROMPT_SUFFIX = "\n\nCurrent working directory: /home/user/project";

function promptWith(docReadingText: string): string {
  return `${PROMPT_PREFIX}${docReadingText}${PROMPT_SUFFIX}`;
}

describe("applyDocReadingScopePatch", () => {
  it("replaces the exact known upstream text and reports 'applied'", () => {
    const result = applyDocReadingScopePatch(promptWith(OLD_DOC_READING_TEXT));

    expect(result.status).toBe("applied");
    expect(result.systemPrompt).toBe(promptWith(NEW_DOC_READING_TEXT));
    expect(result.systemPrompt).not.toContain(OLD_DOC_READING_TEXT);
  });

  it("is a no-op and reports 'already-upstream' when the desired text is already present", () => {
    const prompt = promptWith(NEW_DOC_READING_TEXT);
    const result = applyDocReadingScopePatch(prompt);

    expect(result.status).toBe("already-upstream");
    expect(result.systemPrompt).toBe(prompt);
  });

  it("leaves the prompt untouched and reports 'unrecognized' when neither text matches", () => {
    const prompt = promptWith("- Some future upstream wording we have never seen before");
    const result = applyDocReadingScopePatch(prompt);

    expect(result.status).toBe("unrecognized");
    expect(result.systemPrompt).toBe(prompt);
  });

  it("does not perform partial or fuzzy matches on near-miss text", () => {
    const nearMiss = OLD_DOC_READING_TEXT.replace("cross-references", "cross references");
    const result = applyDocReadingScopePatch(promptWith(nearMiss));

    expect(result.status).toBe("unrecognized");
    expect(result.systemPrompt).toBe(promptWith(nearMiss));
  });

  it("reports 'unrecognized' when only the second bullet is reworded upstream", () => {
    const [firstBullet] = OLD_DOC_READING_TEXT.split("\n");
    const rewordedSecondBullet = `${firstBullet}\n- Read pi docs when needed.`;
    const result = applyDocReadingScopePatch(promptWith(rewordedSecondBullet));

    expect(result.status).toBe("unrecognized");
    expect(result.systemPrompt).toBe(promptWith(rewordedSecondBullet));
  });

  it("still patches the base prompt when the new text was already appended elsewhere", () => {
    const prompt = `${promptWith(OLD_DOC_READING_TEXT)}\n\n${NEW_DOC_READING_TEXT}`;
    const result = applyDocReadingScopePatch(prompt);

    expect(result.status).toBe("applied");
    expect(result.systemPrompt).not.toContain(OLD_DOC_READING_TEXT);
  });

  it("leaves the prompt untouched and reports 'unrecognized' when the old text appears more than once", () => {
    const prompt = `${promptWith(OLD_DOC_READING_TEXT)}\n\n${OLD_DOC_READING_TEXT}`;
    const result = applyDocReadingScopePatch(prompt);

    expect(result.status).toBe("unrecognized");
    expect(result.systemPrompt).toBe(prompt);
  });
});
