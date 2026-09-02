---
name: conversation-context
description: Design or implement LocalNook model context and browser-local conversation lifecycle. Use for ContextBuilder changes, IndexedDB records, conversation CRUD/deletion, reload behavior, regeneration history, or cross-conversation isolation.
---

# Conversation context and persistence

Treat stored records and model request context as separate contracts.

```text
Conversation records -> repository -> active conversation state -> ContextBuilder -> Ollama messages
```

## Invariants

- Each persisted conversation has a stable technical ID.
- Each message belongs to exactly one conversation.
- Only the active conversation contributes conversation history.
- Active system prompts are prepended explicitly and deterministically.
- Ollama receives only intended model fields such as role and content.
- UI IDs, timestamps, storage metadata, durations, and editing flags remain local.
- Aborted or failed partial output is not stored as a completed assistant message.
- Deleting a conversation removes its messages and active references.
- Users can delete one conversation and all conversations.
- Storage identifiers do not change when the display brand changes.
- Storage failures become recoverable application errors rather than silent data loss.

Keep the first IndexedDB implementation small: one database, explicit schema version, one repository, and focused CRUD/deletion tests.
