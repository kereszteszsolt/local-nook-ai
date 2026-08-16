# LAC-011: Add conversation reopen and deletion controls

## Status

Implemented

## User story

As a user, I want to reopen and delete stored conversations so that I remain in control of browser-local history.

## Acceptance criteria

- [x] List stored conversations with a useful title and last-updated time.
- [x] Open one conversation as the active chat.
- [x] Create a new conversation without overwriting the current one.
- [x] Delete one conversation and all of its messages.
- [x] Delete all conversations through an explicit confirmed action.
- [x] Clear invalid active references after deletion.
- [x] Cover empty, loading, error, and keyboard-accessible states.

## Implementation notes

- This story depends on the repository contract in LAC-010.

## Verification

Run focused tests for changed behavior, `npm run build`, and `npm test -- --watch=false --browsers=ChromeHeadless`. Report environment-only limitations explicitly.

## Comments

- Conversation controls use the existing browser-local repository and retain the current chat boundary.
- The focused test bundle compiles, but this container has no ChromeHeadless binary.
