# LAC-007: Manage reusable system prompts

## Status

Implemented

## User story

As a user, I want to organize and activate reusable system prompts so that I can control local-model behavior without retyping instructions.

## Acceptance criteria

- [x] Prompts can be grouped into folders.
- [x] Individual prompts and whole folders can be activated or deactivated.
- [x] Prompts can be added, edited, renamed, and removed.
- [x] Prompt data remains browser-local and malformed stored data is handled safely.
- [x] CSV and JSON import plus JSON export are available.
- [x] Quoted CSV fields with commas and line breaks are parsed correctly.

## Implementation evidence

- `SystemPromptSettingsComponent` owns prompt editing/import/export UI.
- `SystemPromptRepository` validates and stores prompt records.

## Verification

Preserve this behavior through focused unit tests and the repository build/test commands. Use a local Ollama smoke test for the real browser-to-runtime path.
