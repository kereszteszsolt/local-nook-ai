# AGENTS.md

## Purpose

**LocalNook** is the working product name for the `ng-ollama` repository. It is a lightweight Angular client for private, browser-local conversations with models served by a local Ollama instance.

Keep the repository small and credible. Prefer clear contracts, typed boundaries, focused tests, and concise documentation over framework-heavy abstractions.

## Working agreements

- Read the relevant `LAC-*` story under `docs/releases/` before changing behavior.
- Preserve the implemented Release 0.1 capabilities unless a story explicitly changes them.
- Keep Ollama external to this application. Do not install or manage the Ollama runtime from the UI.
- Use the official `ollama/browser` client behind `OllamaClientService`; components must not implement transport or wire parsing.
- Keep UI state in `ChatFacade`, model context construction in `ChatContextBuilder`, and storage behind repositories.
- Conversation history remains in memory until the IndexedDB stories are implemented. Do not claim persistence before then.
- Browser-local data must have an explicit user-controlled deletion path when persistence is added.
- Use `BrandConfig` for product/developer labels. Do not derive storage keys or database names from the display brand.
- Send only intentional model context fields to Ollama. Do not send UI IDs, durations, editing flags, or storage metadata.
- Never persist a partial or aborted assistant stream as a completed message.
- Prefer Angular-native dependency injection and signals. Add a dependency only when it removes real risk or custom code.

## Architecture direction

```mermaid
flowchart LR
    UI[Angular components] --> F[ChatFacade]
    F --> C[ChatContextBuilder]
    F --> O[OllamaClientService]
    O --> SDK[ollama/browser]
    SDK --> LOCAL[Local Ollama]
    F --> P[SystemPromptRepository]
    P --> LS[localStorage]
    F -. Release 0.2 .-> CR[ConversationRepository]
    CR -. planned .-> IDB[IndexedDB]
```

See `docs/architecture.md`, `docs/ollama-integration.md`, and `docs/storage-and-context.md`.

## Design and branding

- Working display name: `LocalNook`.
- Repository name: `ng-ollama`.
- Stable story prefix: `LAC-` (Local AI Client).
- Developer metadata: Keresztes Zsolt — `https://kereszteszsolt.hu`.
- Use semantic Tailwind theme variables for reusable product-level decisions.
- Use Penpot MCP only for relevant visual work, beginning with inspection and small reversible changes.
- Preserve accessibility, keyboard behavior, loading/error states, and responsive layout.

## Repository skills

Use only the skill that matches the task:

- `angular-feature-delivery` — Angular feature, fix, refactor, or dependency work.
- `ollama-integration` — model discovery, streaming, thinking, cancellation, and the official SDK boundary.
- `conversation-context` — context construction and the planned IndexedDB conversation lifecycle.
- `ui-design` — Penpot-assisted UI work and semantic Tailwind tokens.
- `release-evidence` — release stories, status, acceptance criteria, and verification evidence.

## Custom agents

Use subagents for non-trivial work, not as ceremony:

- `architect` — plans cross-cutting stories and boundary changes.
- `implementation_worker` — owns a bounded implementation after scope is understood.
- `reviewer` — checks correctness, tests, regressions, privacy, and unnecessary complexity.
- `design_reviewer` — checks user-visible changes, tokens, accessibility, and Penpot alignment.

Prefer one write-owning agent at a time. Small documentation or isolated fixes do not require delegation.

## License headers

The repository is Apache-2.0. During this cleanup phase, add the short SPDX header only to **new** hand-authored source/configuration files that support comments:

```text
SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
SPDX-License-Identifier: Apache-2.0
```

Do not add headers to pre-existing files merely because they were edited. Do not force headers into JSON, Markdown, lock files, generated files, vendored code, or binary assets. See `docs/licensing.md`.

## Verification

For implementation changes, run:

```bash
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

Report environment limitations explicitly. Do not mark a story or acceptance criterion complete without implementation or verification evidence.
