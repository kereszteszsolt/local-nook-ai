# LAC-002: Stream assistant responses

## Status

Implemented

## User story

As a user, I want assistant output to appear while it is generated so that local-model responses feel responsive.

## Acceptance criteria

- [x] Chat requests include the selected model and current model context.
- [x] Assistant content is exposed incrementally while the stream is active.
- [x] Loading state begins before streamed parts are consumed and ends on every completion path.
- [x] Only completed non-empty assistant output is appended to conversation history.
- [x] Stream failures do not store partial output as a completed assistant message.

## Implementation evidence

- `ChatFacade` owns partial content and loading signals.
- `OllamaClientService.streamChat()` exposes mapped SDK chunks.

## Verification

Preserve this behavior through focused unit tests and the repository build/test commands. Use a local Ollama smoke test for the real browser-to-runtime path.
