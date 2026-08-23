# LAC-028: User guide

## Status

Planned

## User story

As a LocalNook user, I want one accurate guide for setup, daily use, privacy, and troubleshooting so that I can use implemented capabilities without confusing them with planned work.

## Context

Current engineering documents describe individual boundaries, but public guidance is fragmented and some repository presentation still describes obsolete in-memory behavior.

## Scope

Create `docs/user-guide.md` from verified behavior and link it to startup, screenshot, architecture, privacy, troubleshooting, and release evidence.

## Acceptance criteria

- [ ] Document supported prerequisites and both existing-host and containerized Ollama startup modes.
- [ ] Explain model installation, discovery, eligibility, and selection.
- [ ] Explain chat submission, streaming, stop, regenerate, new chat, copy, and thinking-mode behavior.
- [ ] Explain conversation reopening, per-conversation model/thinking state, deletion, reload behavior, and any recoverable storage errors.
- [ ] Explain system-prompt management, the protected built-in prompt, folders, activation, import, export, restore, and deletion behavior.
- [ ] Describe supported Markdown, highlighted code, Mermaid, KaTeX, and bounded Vega-Lite output accurately.
- [ ] Describe actual browser-local storage, origin boundaries, Ollama request context, privacy limits, and explicit deletion paths.
- [ ] Include troubleshooting for Ollama availability, missing models, browser-origin errors, endpoint overrides, Docker, WSL, browser tests, and rich rendering.
- [ ] Link to the screenshot gallery, architecture, storage/context, Ollama integration, testing, and Releases 0.1 through 0.3.
- [ ] Verify every documented capability and command against the current application and avoid presenting planned behavior as implemented.

## Verification

Review the guide against code, configuration, browser behavior, startup commands, generated screenshots, and release evidence; validate internal links and fenced Mermaid examples.

## Out of scope

Developer API documentation, unsupported platform guarantees, hosted Ollama instructions, and documentation for future authentication, cloud sync, RAG, or telemetry are excluded.

## Implementation evidence

None recorded in this planning commit. Evidence will be added during LAC-028 implementation.
