# LAC-020: Refine thinking display

## Status

Implemented

## User story

As a user, I want assistant thinking to stay available without taking over the response, so that I can inspect it when useful and keep the answer easy to read.

## Acceptance criteria

- [x] Show assistant thinking in a compact, semantic panel that fits the LocalNook visual language.
- [x] Keep completed thinking collapsed by default so the answer remains the primary content.
- [x] Show a bounded, faded preview of the newest thinking text while a response is streaming.
- [x] Let users expand the active preview to a bounded ten-line view without exposing the full transcript.
- [x] Let keyboard and pointer users expand and collapse the complete thinking text from an accessible control.
- [x] Constrain expanded long-form thinking to a scrollable area instead of allowing it to dominate the chat page.
- [x] Cover the collapsed and expanded thinking states with a focused component test.

## Verification

Run focused tests for changed behavior, `npm run build`, and `npm test -- --watch=false --browsers=ChromeHeadless`. Report environment-only limitations explicitly.

## Comments

- The design replaces the former alert-like box with a compact accent-edged disclosure panel.
- During streaming, the latest short excerpt is visible; the complete record becomes available once the response is complete.
- Streaming previews can expand to ten lines and show an animated ellipsis beside the Thinking label.
- The test bundle compiles, but the container has no ChromeHeadless binary; the production build still exceeds the existing bundle budget.
