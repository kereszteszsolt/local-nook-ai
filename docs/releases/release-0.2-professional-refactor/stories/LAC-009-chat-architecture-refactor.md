# LAC-009: Refactor chat responsibilities

## Status

Implemented

## User story

As a maintainer, I want chat state, context construction, provider integration, and prompt storage separated so that the code is easier to test and evolve.

## Acceptance criteria

- [x] Components delegate chat use cases to one facade.
- [x] Ollama SDK calls are isolated in `OllamaClientService`.
- [x] Model request context is built by `ChatContextBuilder`.
- [x] System prompt persistence is isolated in `SystemPromptRepository`.
- [x] Typed component events replace serialized JSON payloads.
- [x] Pre-existing custom API/base service files are removed rather than wrapped by another layer.

## Implementation evidence

- The implemented flow is documented in `docs/architecture.md`.

## Verification

Run focused tests for changed behavior, `npm run build`, and `npm test -- --watch=false --browsers=ChromeHeadless`. Report environment-only limitations explicitly.
