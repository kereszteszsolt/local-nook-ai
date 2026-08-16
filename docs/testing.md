# Testing

## Required commands

```bash
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

## Current focused coverage

- `ChatContextBuilder`: active prompt ordering, narrow model fields, and empty/system-history filtering.
- `OllamaClientService`: official model mapping, streamed content/thinking/duration, and client cancellation.
- `ChatFacade`: selected-model guard, completed response storage, thinking-only completion rejection, regeneration without duplicate user messages, and stale-chunk isolation after abort.
- `SystemPromptRepository`: malformed data, entry validation, and legacy-key migration.
- `ChatInputComponent`: typed composer event instead of serialized component payloads.
- `SystemPromptSettingsComponent`: quoted CSV fields and JSON import validation.
- `ChatMessageComponent`: regeneration ID routing and non-blocking clipboard failure feedback.
- `App` and `NavComponent`: BrandConfig browser/title usage and model loading/selection.

## Test boundaries

Unit tests replace the injected Ollama SDK client; they must not require a live model server. Manual smoke testing covers actual browser origin configuration, local model availability, real streaming, cancellation latency, and rendering with representative content.

## Planned persistence coverage

LAC-010 and LAC-011 should add deterministic IndexedDB tests for create/list/open, append, reload recovery, delete-one, delete-all, schema migration, and failure recovery. Context tests must prove that one conversation never contributes messages to another.

Do not keep tests that only instantiate a class when a meaningful behavior can be asserted instead.
