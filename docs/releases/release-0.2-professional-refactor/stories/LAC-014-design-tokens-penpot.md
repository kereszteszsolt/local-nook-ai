# LAC-014: Introduce semantic design tokens and Penpot workflow

## Status

In progress

## User story

As a designer or frontend maintainer, I want semantic Tailwind tokens and an optional Penpot workflow so that visual changes are consistent and easier to review.

## Acceptance criteria

- [x] Define a top-level Tailwind `@theme` block with semantic color and radius variables.
- [x] Use semantic token utilities in the primary chat composer, chat page, and response treatment.
- [x] Document local Penpot MCP setup and safe inspection-first usage.
- [x] Configure Penpot as an optional, non-blocking project MCP server.
- [ ] Complete a focused pass over remaining legacy raw palette and one-off styling.
- [ ] Record the final mapping between any maintained Penpot tokens and code tokens.

## Current evidence and remaining work

- Current work establishes the token contract without redesigning every existing screen.

## Verification

Run focused tests for changed behavior, `npm run build`, and `npm test -- --watch=false --browsers=ChromeHeadless`. Report environment-only limitations explicitly.
