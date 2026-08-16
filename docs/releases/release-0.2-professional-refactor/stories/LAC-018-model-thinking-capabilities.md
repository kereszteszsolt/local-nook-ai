# LAC-018: Respect model thinking capabilities

## Status

Implemented

## User story

As a user, I want Thinking to be available only for compatible local models, so that the control accurately reflects the selected model's support.

## Acceptance criteria

- [x] Preserve Ollama thinking capability information when listing chat models.
- [x] Enable Thinking only for the selected model when it explicitly supports thinking.
- [x] Reset an enabled Thinking control when a non-thinking model becomes active.
- [x] Prevent the chat request from sending `think: true` for a non-thinking model.
- [x] Cover model-capability behavior with focused tests.

## Verification

Run focused tests for changed behavior, `npm run build`, and `npm test -- --watch=false --browsers=ChromeHeadless`. Report environment-only limitations explicitly.

## Comments

- Models without an explicit `thinking` capability keep the Thinking control disabled.
- The test bundle compiles, but the container has no ChromeHeadless binary; the production build still exceeds the existing bundle budget.
