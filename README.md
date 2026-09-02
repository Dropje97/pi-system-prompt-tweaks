# Pi System Prompt Tweaks

Small, targeted, update-safe corrections to Pi's built-in system prompt.

The project uses a Pi extension to patch known prompt text at runtime instead of
replacing the complete system prompt or modifying installed Pi files. Patches
must match exact upstream text and fail closed when that text changes.

The first tweak scopes Pi documentation reading to the current task.
See [upstream issue #9014](https://github.com/earendil-works/pi/issues/9014)
and [this repo's issue #1](https://github.com/Dropje97/pi-system-prompt-tweaks/issues/1).

Status: implemented.

## What it does

This repo hosts one Pi extension (`src/index.ts`) that can carry multiple
independent, individually named patches. Each patch lives in its own file
under `src/`, named after the patch, not the repo — that way the project name
stays generic while each patch keeps a precise identity.

### Patch: `scoped-pi-doc-reading`

Pi's default system prompt tells the agent to always read pi `.md` files
completely and follow every cross-reference. On `before_agent_start`, this
patch checks the assembled system prompt for that exact known text and, if
found, replaces it with task-scoped guidance: read the sections needed for
the current question, follow only materially relevant cross-references, and
read a full document only when broad coverage or full-context interpretation
is genuinely required.

If the exact known text isn't found exactly once — because the desired wording
is already there, upstream changed the wording to something else entirely, or
the old text unexpectedly appears more than once — the patch leaves the prompt
untouched rather than guessing. If a session uses a custom system prompt
(`SYSTEM.md`, `--system-prompt`, etc.), there are no default doc-reading
bullets to patch in the first place, and that's reported as its own state
rather than as a false "upstream changed" alarm.

Run `/prompt-tweaks-status` in a Pi session to see which state applied. The
extension also proactively raises a warning notification the first time a
session hits the "unrecognized" state, so you don't have to remember to poll
the status command yourself.

**Known limitation:** notifications are sent via `ctx.ui.notify()`, which
Pi's own RPC protocol defines as fire-and-forget — the host client "can
display the information or ignore it" (see `docs/rpc.md` in the Pi package).
Confirmed to render, by reading each host's own source:
- Pi TUI and plain RPC clients — per Pi's own `docs/rpc.md`.
- T3 Code — `PiAdapterV2.ts` in the t3-code-pi server turns `method: "notify"`
  into a completed activity item.
- `pi-web-ui` — `server/webui-context.ts` bridges `notify` straight to a
  browser `notice` message.
- `@jmfederico/pi-web` — `src/server/sessions/piSessionService.ts` publishes
  `notify` calls through its notification store to the frontend.

Confirmed silent: Pi's own print mode (`pi -p`). Only `rpc-mode.js` and
`interactive-mode.js` supply a real UI context; every other mode (including
print) falls back to Pi's `noOpUIContext`, where `notify` is a no-op — so a
drift warning during `pi -p` is discarded, not just "unconfirmed."

Any other, unlisted third-party embedding is unconfirmed either way. This
only affects the diagnostic notification; the patch itself (and its
fail-closed behavior) does not depend on any UI and works the same
everywhere, including print mode.

## Install

```bash
pi install git:github.com/Dropje97/pi-system-prompt-tweaks
```

Update to the latest `main` with:

```bash
pi update --extension git:github.com/Dropje97/pi-system-prompt-tweaks
```

Then run `/reload` in any open session.

## Develop

```bash
pnpm install
pnpm typecheck
pnpm test
```

Try the extension locally without installing it:

```bash
pi -e ./src/index.ts
```
