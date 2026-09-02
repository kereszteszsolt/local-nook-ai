# LAC-013: Harden streaming and error state

## Status

Implemented

## User story

As a user, I want failed, empty, or cancelled generations to leave the chat in a clear state so that I can recover without reloading.

## Acceptance criteria

- [x] Sending is blocked while a response is already loading.
- [x] Sending without a selected model leaves history unchanged and shows an actionable message.
- [x] Abort clears partial output and ends loading state.
- [x] Abort and provider errors do not store partial assistant output.
- [x] An empty completed stream produces an explicit error instead of an empty message.
- [x] Model-list and stream failures are represented by facade error state.

## Implementation evidence

- The adapter and facade have focused tests for mapping, cancellation, selected-model guarding, and completion behavior.

## Verification

Run focused tests for changed behavior, `npm run build`, and `npm test -- --watch=false --browsers=ChromeHeadless`. Report environment-only limitations explicitly.
