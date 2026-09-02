# LAC-010: Persist conversations in IndexedDB

## Status

Implemented

## User story

As a user, I want conversations stored in IndexedDB so that I can close the browser and reopen previous local chats.

## Acceptance criteria

- [x] Define a stable database name and explicit schema version.
- [x] Persist conversation metadata and ordered messages with stable IDs.
- [x] Create one repository boundary for create, list, read, update, and delete operations.
- [x] Restore a selected conversation after reload without mixing histories.
- [x] Surface storage failures as recoverable application errors.
- [x] Add deterministic repository tests for persistence, reload, and schema upgrades.

## Implementation notes

- Keep the first schema small and brand-independent. Use a browser IndexedDB wrapper only if it removes meaningful boilerplate and preserves explicit ownership.

## Verification

Run focused tests for changed behavior, `npm run build`, and `npm test -- --watch=false --browsers=ChromeHeadless`. Report environment-only limitations explicitly.

## Comments

- Native IndexedDB storage is brand-independent; completed assistant messages only are saved.
- The focused test bundle compiles, but this container has no ChromeHeadless binary.
