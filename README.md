# Pi System Prompt Tweaks

Small, targeted, update-safe corrections to Pi's built-in system prompt.

The project uses a Pi extension to patch known prompt text at runtime instead of
replacing the complete system prompt or modifying installed Pi files. Patches
must match exact upstream text and fail closed when that text changes.

The first planned tweak scopes Pi documentation reading to the current task.
See [upstream issue #9014](https://github.com/earendil-works/pi/issues/9014).

Status: initial implementation is being designed.
