# Release 0.2 — Professional refactor

## Status

In progress

This release improves the supplied MVP without turning it into a backend-heavy or framework-heavy system. Completed stories already have code/configuration evidence; the broad dependency pass remains planned.

| Story | Refactor | Status |
|---|---|---|
| [LAC-008](stories/LAC-008-official-ollama-client.md) | Adopt the official Ollama browser client | Implemented |
| [LAC-009](stories/LAC-009-chat-architecture-refactor.md) | Refactor chat responsibilities | Implemented |
| [LAC-010](stories/LAC-010-indexeddb-conversations.md) | Persist conversations in IndexedDB | Implemented |
| [LAC-011](stories/LAC-011-conversation-management.md) | Add conversation reopen and deletion controls | Implemented |
| [LAC-012](stories/LAC-012-context-builder.md) | Build deterministic model context | Implemented |
| [LAC-013](stories/LAC-013-streaming-error-handling.md) | Harden streaming and error state | Implemented |
| [LAC-014](stories/LAC-014-design-tokens-penpot.md) | Introduce semantic design tokens and Penpot workflow | Implemented |
| [LAC-015](stories/LAC-015-quality-agent-workflow.md) | Add a focused AI-assisted repository workflow | Implemented |
| [LAC-016](stories/LAC-016-brand-configuration.md) | Centralize product branding | Implemented |
| [LAC-017](stories/LAC-017-dependency-modernization.md) | Modernize library versions deliberately | Implemented |
| [LAC-018](stories/LAC-018-model-thinking-capabilities.md) | Respect model thinking capabilities | Implemented |
| [LAC-019](stories/LAC-019-conversation-deletion-confirmation.md) | Confirm conversation deletion | Implemented |
| [LAC-020](stories/LAC-020-thinking-display.md) | Refine the thinking display | Implemented |
| [LAC-021](stories/LAC-021-conversation-model-selection.md) | Persist conversation model selection | Implemented |
| [LAC-022](stories/LAC-022-vega-lite-visualizations.md) | Render Vega-Lite data visualizations | Implemented |

## Ordering

The current official SDK, application boundaries, deterministic context builder, stream state, brand config, and browser-local conversation workflow form the baseline. Complete the dependency modernization after the main architecture is stable enough to distinguish migration defects from refactor defects.
