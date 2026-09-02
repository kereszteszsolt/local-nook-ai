# LAC-023: Built-in rich-rendering system prompt and IndexedDB migration

## Status

Implemented

## User story

As a user, I want a built-in, controllable system prompt that tells local models about LocalNook rich-response formats, so that capable models consistently return Markdown, Mermaid diagrams, KaTeX, Prism-highlighted code, and safe Vega-Lite charts while I retain control over my browser-local prompt library.

## Acceptance criteria

- [x] Seed a canonical, stable-ID `LocalNook rich response formats` prompt that is active by default and describes the supported Markdown, Mermaid, KaTeX, Prism, and bounded Vega-Lite response formats.
- [x] Allow users to activate or deactivate the built-in prompt and restore its canonical instructions, but never edit, delete, folder-delete, or import-overwrite it.
- [x] Store prompt records and their activation state in a dedicated, brand-independent IndexedDB repository, separate from the conversation database.
- [x] Migrate valid data from `local-ai-client.system-prompts.v1`, falling back to `ollama-chat-system-prompts`, exactly once; preserve custom-prompt order and active state, and remove legacy localStorage keys only after a successful IndexedDB transaction.
- [x] Preserve custom prompt folders, CRUD, import, export, and explicit permanent deletion; imports and exports cover custom prompts only.
- [x] Deterministically prepend the active built-in prompt before active custom prompts, in explicit stored order, while sending Ollama only the intended `role` and `content` fields.
- [x] Make prompt loading and mutations asynchronous without an empty-state overwrite race; show a recoverable loading or storage error in the settings UI.
- [x] Provide an accessible desktop and mobile prompt-settings design that clearly separates the LocalNook default from user prompts, exposes the active state, and preserves keyboard-operable controls.
- [x] Cover repository schema/migration/error cases, context ordering and activation, protection of the built-in prompt, and prompt-settings loading/error behavior with focused tests.

## Architecture and implementation notes

- Keep `ChatContextBuilder` as the only model-context boundary. The repository metadata, IDs, folders, and timestamps must not be sent to Ollama.
- Use a dedicated `local-ai-client.system-prompts` IndexedDB database at schema version 1, with `prompts` and `metadata` stores. A dedicated database prevents unrelated repositories from owning the same schema and keeps conversation deletion independent from prompt storage.
- Give records an explicit `position`; do not rely on `IndexedDB.getAll()` order for model context. The built-in prompt is always first when active, followed by active custom prompts in ascending position.
- Use a migration marker in `metadata` so a deleted legacy prompt cannot return on later loads. If the IndexedDB transaction fails, retain the source localStorage data and surface a recoverable error.
- The built-in instructions must state that a Vega-Lite chart is a single complete `vega-lite` fenced JSON block in the final answer, using bounded inline `data.values`; it must not appear in thinking content or request unsupported remote data, transforms, expressions, or executable input.
- Penpot design boards: `LAC-023 System Prompts — Desktop` and `LAC-023 System Prompts — Mobile`.

## Verification

Run focused repository, facade, context-builder, and settings-component tests, then `npm run build` and `npm test -- --watch=false --browsers=ChromeHeadless`. Confirm the migration with a browser profile containing each legacy localStorage format and verify that existing LAC-022 rich-rendering responses remain unaffected.

## Comments

- Docker production compilation succeeds, then fails only on the pre-existing 1 MB initial-bundle budget (4.69 MB).
- The Karma bundle compiles the new focused specs, but this Docker image has no ChromeHeadless binary, so the browser tests and interactive migration check remain pending.
