---
name: angular-feature-delivery
description: Use for LocalNook Angular standalone components, signals/RxJS, dependency injection, feature UI, builds or typed frontend refactors.
---

# Angular feature integration

1. Inspect one active task, the affected components, `ChatFacade` and relevant tests; read architecture docs only if a boundary changes.
2. Keep components presentational and event-focused; `ChatFacade` coordinates state, `OllamaClientService` owns SDK calls, repositories own IndexedDB.
3. Prefer Angular-native DI, Signals/RxJS and strict typing; avoid unnecessary wrappers or new state libraries.
4. Preserve browser-local storage deletion, remote endpoint privacy notices, and stable brand-independent identifiers.
5. Cover loading, abort, error and completed response transitions with focused tests.
6. Run `npm run build` and relevant Angular tests; do not claim a successful live Ollama connection without a dedicated smoke check.
