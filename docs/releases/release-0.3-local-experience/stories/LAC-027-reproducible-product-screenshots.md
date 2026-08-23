# LAC-027: Reproducible product screenshots

## Status

Planned

## User story

As a maintainer, I want deterministic product screenshots generated from controlled local fixtures so that documentation presents real LocalNook behavior without exposing private conversations or depending on a live model.

## Context

The repository has no Playwright setup or screenshot gallery. Screenshot generation must be reproducible from WSL-compatible project commands and isolated from the user's Ollama data.

## Scope

Add the smallest local Playwright workflow, deterministic test-only provider fixtures, representative desktop/mobile scenarios, committed screenshots, and regeneration documentation.

## Acceptance criteria

- [ ] Provide a documented `npm run screenshots` command using a repository-local Playwright configuration.
- [ ] Generate screenshots without requiring a live Ollama server or modifying real browser-local user data.
- [ ] Use deterministic, privacy-safe fixture content with stable model, time, animation, viewport, and network behavior.
- [ ] Capture a representative desktop chat view.
- [ ] Capture model-selection and system-prompt-management views.
- [ ] Capture rich Markdown, highlighted code, Mermaid, KaTeX, and supported chart output.
- [ ] Capture a representative mobile layout.
- [ ] Store approved generated images under `docs/screenshots/` with descriptive stable filenames.
- [ ] Document prerequisites, regeneration, fixture boundaries, and screenshot review.
- [ ] Verify screenshot privacy, expected dimensions, deterministic reruns, and failure behavior when the browser is unavailable.

## Verification

Install dependencies reproducibly, run `npm run screenshots`, inspect every generated image, confirm no live Ollama request or user storage dependency, and record browser/environment limitations.

## Out of scope

Visual-regression gating, cloud browser services, recording real user data, model-dependent golden output, and redesigning the product solely for screenshots are excluded.

## Implementation evidence

None recorded in this planning commit. Evidence will be added during LAC-027 implementation.
