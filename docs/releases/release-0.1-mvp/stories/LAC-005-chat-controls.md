# LAC-005: Control the active chat

## Status

Implemented

## User story

As a user, I want clear controls for stopping, restarting, regenerating, and copying so that I can manage a local conversation without reloading the application.

## Acceptance criteria

- [x] The user can stop an active response.
- [x] Stopping clears partial UI state and does not store an incomplete assistant message.
- [x] The user can start a new empty chat.
- [x] The user can regenerate from an earlier user request without duplicating that user message.
- [x] The user can copy completed assistant content.

## Implementation evidence

- `ChatFacade.abortChatMessage()`, `newChat()`, and `regenerateResponse()` own chat state transitions.
- Composer and message toolbars expose the controls.

## Verification

Preserve this behavior through focused unit tests and the repository build/test commands. Use a local Ollama smoke test for the real browser-to-runtime path.
