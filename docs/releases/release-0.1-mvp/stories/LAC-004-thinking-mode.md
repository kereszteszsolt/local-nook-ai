# LAC-004: Enable optional model thinking

## Status

Implemented

## User story

As a user, I want to enable supported model thinking and inspect it separately from the final answer so that I can understand the generation process when a model provides it.

## Acceptance criteria

- [x] The composer exposes an optional thinking toggle.
- [x] The selected setting is passed intentionally with the chat request.
- [x] Streamed thinking output is displayed separately from final content.
- [x] Thinking can be expanded or collapsed in the response view.
- [x] Regeneration preserves the original user message thinking choice.

## Implementation evidence

- The typed composer event carries `content` and `think`.
- `ChatFacade` accumulates partial thinking separately.
- `ChatMessageComponent` renders the thinking section.

## Verification

Preserve this behavior through focused unit tests and the repository build/test commands. Use a local Ollama smoke test for the real browser-to-runtime path.
