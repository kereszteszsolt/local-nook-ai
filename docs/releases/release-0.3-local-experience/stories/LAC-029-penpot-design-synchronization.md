# LAC-029: Penpot design synchronization

## Status

Planned

## User story

As a maintainer, I want meaningful Release 0.3 UI changes reconciled with the connected Penpot file and semantic tokens so that design evidence follows the implemented product without forcing a redesign.

## Context

The connected Penpot file already contains LocalNook desktop/mobile boards, system-prompt boards, and a semantic token set. Penpot is optional and must not block non-visual release work.

## Scope

Inspect the implemented Release 0.3 UI, compare only relevant changed surfaces with Penpot and semantic Tailwind tokens, make small reversible design updates when justified, and record the actual synchronization outcome.

## Acceptance criteria

- [ ] Inspect the connected Penpot file, focused page, relevant boards, and token sets before any design write.
- [ ] Identify which implemented Release 0.3 changes materially affect layout, interaction states, branding, or presentation.
- [ ] Keep Penpot decisions aligned with the semantic Tailwind token contract and the implemented UI.
- [ ] Preserve keyboard behavior, focus visibility, loading, empty, error, disabled, and responsive states in the design review.
- [ ] Make only small, relevant, reversible Penpot changes and avoid an unrelated redesign.
- [ ] Do not treat Penpot as a runtime dependency or block the release when the connector is unavailable.
- [ ] Record connected file/page evidence, inspected boards, token findings, changes made, or the reason no design change was necessary.
- [ ] Reinspect and visually compare any modified design surface after synchronization.

## Verification

Use read-only MCP inspection first, inspect rendered application states, compare semantic tokens and responsive layouts, and export or capture changed boards when visual evidence is necessary.

## Out of scope

A full design-system rewrite, speculative screens, new product workflows, raw-palette divergence from semantic tokens, and Penpot changes unrelated to implemented Release 0.3 behavior are excluded.

## Implementation evidence

None recorded in this planning commit. Evidence will be added during LAC-029 implementation.
