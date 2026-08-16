# LAC-011: Add conversation reopen and deletion controls

## Status

Planned

## User story

As a user, I want to reopen and delete stored conversations so that I remain in control of browser-local history.

## Acceptance criteria

- [ ] List stored conversations with a useful title and last-updated time.
- [ ] Open one conversation as the active chat.
- [ ] Create a new conversation without overwriting the current one.
- [ ] Delete one conversation and all of its messages.
- [ ] Delete all conversations through an explicit confirmed action.
- [ ] Clear invalid active references after deletion.
- [ ] Cover empty, loading, error, and keyboard-accessible states.

## Implementation notes

- This story depends on the repository contract in LAC-010.

## Verification

Run focused tests for changed behavior, `npm run build`, and `npm test -- --watch=false --browsers=ChromeHeadless`. Report environment-only limitations explicitly.
