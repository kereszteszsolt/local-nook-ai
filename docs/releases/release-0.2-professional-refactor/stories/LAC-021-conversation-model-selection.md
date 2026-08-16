# LAC-021: Persist conversation model selection

## Status

Implemented

## User story

As a user, I want each saved conversation and the model selector to retain the intended local model, so that reopening chats keeps the right model when it is still available.

## Acceptance criteria

- [x] Save the selected model identifier with every newly persisted conversation in IndexedDB.
- [x] Restore an active or opened conversation's available saved model as the active selector model.
- [x] Fall back to the first available model when a conversation's saved model is unavailable without overwriting that saved identifier.
- [x] Persist the latest active model selection in browser-local storage and restore it when no conversation model applies.
- [x] Persist an explicit model change to the active saved conversation.
- [x] Keep legacy conversations without a saved model readable.
- [x] Cover storage migration, selection, fallback, and conversation switching with focused tests.
- [x] Save and restore the per-conversation thinking toggle state in IndexedDB.

## Verification

Run focused tests for changed behavior, `npm run build`, and `npm test -- --watch=false --browsers=ChromeHeadless`. Report environment-only limitations explicitly.

## Comments

- Conversation records keep Ollama's stable `model` identifier; the global last selection uses a separate brand-independent localStorage key.
- Focused test bundles compile; runtime tests need ChromeHeadless, and the existing production bundle budget still fails.
- Thinking state is preserved per conversation while unsupported models keep the control disabled.
