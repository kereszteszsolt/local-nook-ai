# LAC-019: Confirm conversation deletion

## Status

Implemented

## User story

As a user, I want to explicitly confirm deletion of saved conversations, so that browser-local history is removed only intentionally.

## Acceptance criteria

- [x] Ask for confirmation before deleting one saved conversation.
- [x] Leave the conversation unchanged when its deletion modal is cancelled or dismissed.
- [x] Delete the selected conversation and its messages only after modal confirmation.
- [x] Ask for confirmation before deleting all saved conversations.
- [x] Cover deletion-confirmation behavior with focused tests.

## Verification

Run focused tests for changed behavior, `npm run build`, and `npm test -- --watch=false --browsers=ChromeHeadless`. Report environment-only limitations explicitly.

## Comments

- One shared Angular Material modal handles individual and all-conversation deletion.
- The test bundle compiles, but the container has no ChromeHeadless binary; the production build still exceeds the existing bundle budget.
