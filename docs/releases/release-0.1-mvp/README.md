# Release 0.1 — MVP

## Status

Implemented baseline

This release records the user-visible behavior present in the supplied project. The later refactor may improve internals while preserving these capabilities.

| Story | Capability | Status |
|---|---|---|
| [LAC-001](stories/LAC-001-local-model-discovery.md) | Discover and select local models | Implemented |
| [LAC-002](stories/LAC-002-streaming-chat.md) | Stream assistant responses | Implemented |
| [LAC-003](stories/LAC-003-conversation-context.md) | Keep the active conversation in context | Implemented |
| [LAC-004](stories/LAC-004-thinking-mode.md) | Enable optional model thinking | Implemented |
| [LAC-005](stories/LAC-005-chat-controls.md) | Control the active chat | Implemented |
| [LAC-006](stories/LAC-006-rich-response-rendering.md) | Render rich assistant content | Implemented |
| [LAC-007](stories/LAC-007-system-prompt-management.md) | Manage reusable system prompts | Implemented |

## Release boundary

Release 0.1 keeps conversation history in memory and system prompts in browser-local storage. Professional transport, architecture, persistence, design-system, and workflow changes are tracked in Release 0.2.
