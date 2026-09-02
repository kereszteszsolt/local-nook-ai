# LAC-012: Build deterministic model context

## Status

Implemented

## User story

As a maintainer, I want one deterministic context builder so that the model receives only intentional system and conversation content.

## Acceptance criteria

- [x] Active non-empty system prompts are prepended.
- [x] Only non-empty user and assistant messages from the active history are included.
- [x] Only `role` and `content` are copied into the current request DTO.
- [x] System messages found in ordinary history are ignored to prevent accidental duplication.
- [x] Regeneration truncates history at the original user request.
- [x] Focused tests cover ordering and metadata removal.

## Implementation evidence

- `ChatContextBuilder` is pure from the caller perspective and creates a new array for each request.

## Verification

Run focused tests for changed behavior, `npm run build`, and `npm test -- --watch=false --browsers=ChromeHeadless`. Report environment-only limitations explicitly.
