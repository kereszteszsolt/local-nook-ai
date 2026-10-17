---
name: conversation-context
description: Use for LocalNook ChatContextBuilder, browser IndexedDB conversation/prompt repositories, data deletion, migrations or message-history isolation.
---

# Model context and browser persistence

- Trace only the active conversation → repository → `ChatFacade` → `ChatContextBuilder` → Ollama request.
- Build narrow model messages (`role`, `content`, explicitly selected prompts/history); exclude UI IDs, timestamps, durations, local editing fields and unrelated conversations.
- Keep technical IDs and IndexedDB schema stable across display brand changes. Handle corrupted records or migrations explicitly, not by silent data loss.
- Store a streamed assistant reply only after successful completion. Preserve reload, regenerate, delete-one and delete-all consistency.
- Unit-test context isolation, storage errors, deletion and partial/cancelled streams; do not add remote sync, backend accounts or encryption claims implicitly.
