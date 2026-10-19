# LocalNook AI Codex engineering guide

LocalNook is an **Angular / TypeScript** browser client for an external Ollama runtime. It uses the official `ollama/browser` SDK, RxJS/Signals, IndexedDB repositories, Angular Material and Tailwind. The browser owns conversation state; there is **no application backend**. Releases 0.1–0.3 are implemented; do not present documentation ideas as shipped features.

## Progressive context

1. Read this guide, one active `LAC-*` story or requested fix, and the affected source/tests. Read release documentation only to resolve status or dependencies.
2. Open `docs/architecture.md`, `docs/ollama-integration.md`, `docs/storage-and-context.md`, or `docs/design-system.md` **only for relevant changes**.
3. Load a skill only when its technical trigger matches the task; avoid loading all five or triggering all four agents.

## Engineering boundaries

- **Angular:** components render state, handle accessibility and dispatch actions. `ChatFacade` owns application state/orchestration; avoid component-owned transport/persistence or unnecessary dependency layers.
- **Ollama:** `OllamaClientService` owns the official browser SDK and streaming/abort lifecycle. The host comes from `OllamaRuntimeConfig`, separate from display branding. Do not add backend or alternate provider implicitly.
- **Context:** `ChatContextBuilder` constructs only model-safe roles/content and selected prompts/history; exclude UI IDs, timing, storage flags and unrelated conversations. Failed/cancelled stream fragments must not become completed messages.
- **Persistence:** IndexedDB repositories own conversations and system prompts; localStorage keeps a separate active-model setting. Preserve explicit delete-one/delete-all, migration and error behavior. Brand changes must never rename storage keys.
- **UI design:** `BrandConfig` governs visible identity; semantic Tailwind tokens and Angular Material handle consistent styles/keyboard behavior. Penpot MCP is optional and used only on relevant visual tasks with reversible writes.
- Keep client-origin storage/privacy boundaries accurate. Do not claim end-to-end encryption or that an Ollama endpoint is necessarily local.

## On-demand roles and skills

| Skill | When to use |
| --- | --- |
| `angular-feature-delivery` | Angular components, DI, Signals/RxJS, build/runtime integration |
| `ollama-integration` | Ollama browser SDK, streaming, cancellation, model selection |
| `conversation-context` | ContextBuilder, IndexedDB, history/reload and deletion |
| `ui-design` | Material/Tailwind UI, accessibility, Penpot, responsive design |
| `release-evidence` | LAC story status, tests, verification and documentation consistency |

**Default:** main Codex implements directly. `implementation_worker` is sole writer if delegated; `architect`, `reviewer` and `design_reviewer` are optional read-only reviews, used only for meaningful architecture/security/visual risk. There is no automatic agent pipeline. Up to two threads may run, never two writers. Focused skills are engineering guides, not extra business requirements.

## One-story delivery

- Describe scope, likely files, risks and focused checks; ask for explicit implementation approval before story changes.
- Work only within approved criteria. `npm run build` and focused tests come before broader checks; use `npm test -- --watch=false --browsers=ChromeHeadless` when the environment supports it and `npm run screenshots` for affected UI only.
- Report real commands, results and limitations. Discuss the diff, evidence and proposed commit separately; never commit/push/start the next story without explicit approval.
- Keep source comments concise and follow `docs/licensing.md`: the short Apache-2.0 SPDX header belongs to **new** handwritten comment-supporting files, not Markdown, JSON, lock files, generated artifacts or binary assets.

## Docker runtime rules

Use the GitHub repository name as the Compose project: `local-nook-ai`. Publish every host port only on `127.0.0.1`, above 33000, with no port shared by another repository. The current allocation is 33060 for the app and 33061 for optional Ollama. Set `restart: "no"` for every service and disable dependency-triggered restarts. Preserve existing data/model volumes when changing a project name or recreating containers.
