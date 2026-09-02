# LAC-008: Adopt the official Ollama browser client

## Status

Implemented

## User story

As a maintainer, I want Ollama communication implemented through the official browser SDK so that the project does not maintain its own transport and stream parser.

## Acceptance criteria

- [x] The `ollama` package is a direct locked dependency.
- [x] Browser code imports the `Ollama` client from `ollama/browser`.
- [x] Model listing and streamed chat run through an application-owned adapter.
- [x] The adapter consumes the SDK async stream and uses the official client abort operation.
- [x] Obsolete custom HTTP, partial-text, and wire-parsing services are removed.
- [x] SDK mapping is unit-testable without a live Ollama server.

## Implementation evidence

- `src/app/core/config/ollama.config.ts`
- `src/app/features/chat/infrastructure/ollama-client.service.ts`
- `ollama-client.service.spec.ts`

## Verification

Run focused tests for changed behavior, `npm run build`, and `npm test -- --watch=false --browsers=ChromeHeadless`. Report environment-only limitations explicitly.
