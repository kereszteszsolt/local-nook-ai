# LAC-003: Keep the active conversation in context

## Status

Implemented

## User story

As a user, I want each new message to include the current chat history so that the model can answer consistently within the conversation.

## Acceptance criteria

- [x] User and completed assistant messages remain available for the active in-memory chat.
- [x] Each generation receives the current ordered conversation history.
- [x] Active system prompts appear before conversation messages.
- [x] Application-only metadata is omitted from the model request.
- [x] Starting a new chat clears active conversation context.

## Implementation evidence

- `ChatContextBuilder` creates a fresh narrow context array.
- `ChatFacade.newChat()` clears active history and partial state.

## Verification

Preserve this behavior through focused unit tests and the repository build/test commands. Use a local Ollama smoke test for the real browser-to-runtime path.
