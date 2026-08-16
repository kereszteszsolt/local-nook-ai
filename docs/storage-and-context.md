# Storage and context

## Current state

- Conversation messages are stored in IndexedDB through `ConversationRepository` and the active conversation is restored on reload.
- Each saved conversation stores its selected Ollama model identifier and thinking-toggle state in the same IndexedDB record.
- System prompts are stored in localStorage through `SystemPromptRepository`.
- The last active model identifier is stored in localStorage through `ActiveModelRepository` when no available conversation model takes precedence.
- Malformed prompt data returns an empty list instead of breaking startup.
- A legacy prompt key is read and migrated to `local-ai-client.system-prompts.v1`.
- The storage key is deliberately independent of the display brand.

## Model context

`ChatContextBuilder` produces a new model request array for every generation:

1. active, non-empty system prompts;
2. non-empty user and assistant messages from the current in-memory chat.

Only `role` and `content` are copied. Request IDs, response references, durations, thinking toggles, editing state, folder metadata, and persistence metadata stay inside the application.

Regeneration truncates history after the selected original user message, then generates a replacement assistant message without adding the same user message again.

## IndexedDB scope

Release 0.2 provides browser-local conversation persistence with:

- stable conversation IDs and timestamps;
- an optional model identifier and thinking-toggle state for backward-compatible conversation selection;
- messages linked to one conversation;
- explicit schema versioning;
- list/open/create/update operations;
- delete-one and delete-all operations;
- active-conversation recovery after reload;
- visible, recoverable storage errors.

```mermaid
stateDiagram-v2
    [*] --> Empty
    Empty --> Active: create conversation
    Active --> Active: append completed message
    Active --> Stored: persist transaction
    Stored --> Active: reopen
    Active --> Empty: delete active conversation
    Stored --> Empty: delete all conversations
```

The repository must not derive database names or record IDs from `BrandConfig.productName`.

## Deletion behavior

Deletion is part of the persistence contract, not an optional cleanup detail. Removing a conversation must remove its messages and clear any active reference. Delete-all must leave the application in a valid empty state.
