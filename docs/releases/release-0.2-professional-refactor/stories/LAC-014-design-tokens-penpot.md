# LAC-014: Introduce semantic design tokens and Penpot workflow

## Status

Implemented

## User story

As a designer or frontend maintainer, I want semantic Tailwind tokens and an optional Penpot workflow so that visual changes are consistent and easier to review.

## Acceptance criteria

- [x] Define a top-level Tailwind `@theme` block with semantic color and radius variables.
- [x] Use semantic token utilities in the primary chat composer, chat page, and response treatment.
- [x] Document local Penpot MCP setup and safe inspection-first usage.
- [x] Configure Penpot as an optional, non-blocking project MCP server.
- [x] Complete a focused pass over remaining legacy raw palette and one-off styling.
- [x] Record the final mapping between any maintained Penpot tokens and code tokens.

## Implementation evidence

- The final mapping is recorded in `docs/design-system.md`.

## Verification

Run focused tests for changed behavior, `npm run build`, and `npm test -- --watch=false --browsers=ChromeHeadless`. Report environment-only limitations explicitly.

## Comments

- The `LocalNook Semantic` Penpot token set maps directly to the code token contract.
- The focused UI test bundle compiles, but this container has no ChromeHeadless binary.
