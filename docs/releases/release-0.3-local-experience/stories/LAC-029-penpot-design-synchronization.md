# LAC-029: Penpot design synchronization

## Status

Implemented

## User story

As a maintainer, I want meaningful Release 0.3 UI changes reconciled with the connected Penpot file and semantic tokens so that design evidence follows the implemented product without forcing a redesign.

## Context

The connected Penpot file already contains LocalNook desktop/mobile boards, system-prompt boards, and a semantic token set. Penpot is optional and must not block non-visual release work.

## Scope

Inspect the implemented Release 0.3 UI, compare only relevant changed surfaces with Penpot and semantic Tailwind tokens, make small reversible design updates when justified, and record the actual synchronization outcome.

## Acceptance criteria

- [x] Inspect the connected Penpot file, focused page, relevant boards, and token sets before any design write.
- [x] Identify which implemented Release 0.3 changes materially affect layout, interaction states, branding, or presentation.
- [x] Keep Penpot decisions aligned with the semantic Tailwind token contract and the implemented UI.
- [x] Preserve keyboard behavior, focus visibility, loading, empty, error, disabled, and responsive states in the design review.
- [x] Make only small, relevant, reversible Penpot changes and avoid an unrelated redesign.
- [x] Do not treat Penpot as a runtime dependency or block the release when the connector is unavailable.
- [x] Record connected file/page evidence, inspected boards, token findings, changes made, or the reason no design change was necessary.
- [x] Reinspect and visually compare any modified design surface after synchronization.

## Verification

- Read-only MCP inspection succeeded before any design write for Penpot file `9222bdf0-229d-80cd-8008-7e3c7d449595` (`New File 1`) and focused page `9222bdf0-229d-80cd-8008-7e3c7d44c8cb` (`Page 1`). An earlier read-only timeout caused no mutation and did not block repository work.
- Inspected and exported `LocalNook - Desktop chat workspace` (1440 x 980), `LocalNook - Mobile chat workspace` (390 x 844), `LAC-023 System Prompts — Desktop` (900 x 800), and `LAC-023 System Prompts — Mobile` (390 x 844).
- The active `LocalNook Semantic` set contains the documented 12 color/radius tokens. Names and resolved values match `src/styles.scss` and the mapping in `docs/design-system.md`, including the equivalent `12px`/`0.75rem` panel radius.
- Audited LAC-024 through LAC-028 against their commits. They introduce canonical non-rendered metadata, actionable copy through the existing error banner, container/runtime packaging, equivalent local delivery of Roboto and Material Icons, screenshots, and documentation; no component template, component style, semantic token, or interaction pattern changed.
- Visually compared the four live Penpot exports with all five approved application screenshots. Desktop/mobile composition, model selection, system prompts, rich output, typography, icons, color roles, borders, and rounded surfaces remain coherent with the implemented product.
- Reviewed implemented keyboard, focus-visible, loading/status, empty, alert/error, disabled, stop-during-streaming, and responsive states in the current templates and focused specs. The deterministic gallery does not directly capture every transient state, but no Release 0.3 change modifies them.
- No Penpot surface was changed, so a before/after reinspection was not applicable. The exported live baseline and rendered application were compared after the no-change decision to confirm that speculative synchronization or redesign was unnecessary.
- This story changes release evidence only. No build, Karma, screenshot regeneration, or live Ollama smoke was rerun; LAC-027 and LAC-028 retain their applicable runtime evidence and recorded limitations.

## Out of scope

A full design-system rewrite, speculative screens, new product workflows, raw-palette divergence from semantic tokens, and Penpot changes unrelated to implemented Release 0.3 behavior are excluded.

## Implementation evidence

- Penpot remains optional and absent from the production build, runtime, storage, and Ollama request paths. Temporary connector unavailability therefore did not affect application or release behavior.
- Release 0.3 has no material design delta to write back. Zero Penpot changes is the smallest relevant and fully reversible outcome; existing board differences unrelated to implemented Release 0.3 behavior were not redesigned under this story.
- The connected file/page identifiers, four inspected boards, semantic token comparison, exported visual review, no-change rationale, and verification limits are recorded here without claiming an unperformed design mutation.
