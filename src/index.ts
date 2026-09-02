import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { applyDocReadingScopePatch, PATCH_ID, type DocReadingScopeStatus } from "./scoped-pi-doc-reading.ts";

type Status = DocReadingScopeStatus | "not-yet-checked" | "custom-prompt";

const STATUS_MESSAGES: Record<Status, string> = {
  "not-yet-checked": "not yet checked (runs when the agent starts its next turn)",
  applied: "applied — replaced the exhaustive pi-docs reading rule with task-scoped guidance",
  "already-upstream": "no patch needed — the system prompt already has the desired wording",
  "custom-prompt": "no default prompt to patch — this session uses a custom system prompt",
  unrecognized:
    "not applied — the known pi-docs reading rule was not found in the current system prompt. " +
    "Upstream text has likely changed; review src/scoped-pi-doc-reading.ts against the installed Pi version.",
};

export default function (pi: ExtensionAPI) {
  let lastStatus: Status = "not-yet-checked";
  let hasWarnedUnrecognized = false;

  pi.on("before_agent_start", (event, ctx) => {
    if (event.systemPromptOptions.customPrompt) {
      lastStatus = "custom-prompt";
      return;
    }

    const result = applyDocReadingScopePatch(event.systemPrompt);
    lastStatus = result.status;

    if (result.status === "unrecognized" && !hasWarnedUnrecognized) {
      hasWarnedUnrecognized = true;
      ctx.ui.notify(`${PATCH_ID}: ${STATUS_MESSAGES.unrecognized}`, "warning");
    }

    if (result.status !== "applied") {
      return;
    }
    return { systemPrompt: result.systemPrompt };
  });

  pi.registerCommand("prompt-tweaks-status", {
    description: "Show which pi-system-prompt-tweaks patches are applied",
    handler: async (_args, ctx) => {
      ctx.ui.notify(
        `${PATCH_ID}: ${STATUS_MESSAGES[lastStatus]}`,
        lastStatus === "unrecognized" ? "warning" : "info",
      );
    },
  });
}
