# LAC-027: Reproducible product screenshots

## Status

Implemented

## User story

As a maintainer, I want deterministic product screenshots generated from controlled local fixtures so that documentation presents real LocalNook behavior without exposing private conversations or depending on a live model.

## Context

At the start of this story, the repository had no Playwright setup or screenshot gallery. Screenshot generation had to be reproducible from WSL-compatible project commands and isolated from the user's Ollama data.

## Scope

Add the smallest local Playwright workflow, deterministic test-only provider fixtures, representative desktop/mobile scenarios, committed screenshots, and regeneration documentation.

## Acceptance criteria

- [x] Provide a documented `npm run screenshots` command using a repository-local Playwright configuration.
- [x] Generate screenshots without requiring a live Ollama server or modifying real browser-local user data.
- [x] Use deterministic, privacy-safe fixture content with stable model, time, animation, viewport, and network behavior.
- [x] Capture a representative desktop chat view.
- [x] Capture model-selection and system-prompt-management views.
- [x] Capture rich Markdown, highlighted code, Mermaid, KaTeX, and supported chart output.
- [x] Capture a representative mobile layout.
- [x] Store approved generated images under `docs/screenshots/` with descriptive stable filenames.
- [x] Document prerequisites, regeneration, fixture boundaries, and screenshot review.
- [x] Verify screenshot privacy, expected dimensions, deterministic reruns, and failure behavior when the browser is unavailable.

## Verification

Install dependencies reproducibly, run `npm run screenshots`, inspect every generated image, confirm no live Ollama request or user storage dependency, and record browser/environment limitations.

## Out of scope

Visual-regression gating, cloud browser services, recording real user data, model-dependent golden output, and redesigning the product solely for screenshots are excluded.

## Implementation evidence

- `@playwright/test` is pinned to `1.62.1`; `playwright.screenshots.config.ts` runs five isolated Chromium contexts against a dedicated Angular server on `127.0.0.1:4202`.
- The browser uses the `.invalid` fixture endpoint instead of a live Ollama runtime. Exact tags, CORS preflight, and chat operations are fulfilled locally; unexpected external requests are recorded and aborted.
- Fixture requests exercise the real `ollama/browser` adapter while asserting the intentional `messages`, `model`, `stream`, and `think` boundary. No persistent browser profile, storage state, live conversation, or live model response is used.
- Time, UTC timezone, `en-US` locale, light theme, reduced motion, viewports, device scale, model metadata, chat output, network responses, and locally packaged Roboto and Material Icons fonts are fixed. Screenshot CSS removes motion and uses explicit desktop panel clipping to avoid Chromium rounded-corner rasterization drift without changing visible layout.
- The approved gallery contains `desktop-chat.png` at 1440 × 900, model selection and system prompts at 1440 × 1024, rich response at 1440 × 1200, and mobile chat at 390 × 844. The mobile frame truthfully shows the toolbar, model, stacked conversation navigation, and response; its composer remains below the fold.
- The rich response screenshot waits for highlighted Prism tokens, KaTeX, Mermaid SVG, and Vega SVG and rejects fallback alerts before capture.
- The matching `mcr.microsoft.com/playwright:v1.62.1-noble` workflow completed twice with 5/5 tests passing on each run. The sorted SHA-256 sets were byte-identical:
  - `desktop-chat.png`: `a2a68d382bbd142e207294e93275ebdebe17b2f4c3f549e22f31b28230c6c851`;
  - `model-selection.png`: `7e9c1c8e802dcef14867ba48e89ec208a8ca1cfc720adeaa84c28954b3c3e3c2`;
  - `system-prompts.png`: `65032836505553fe05bec31473e81734cb902abf630114dda1b8743523000984`;
  - `rich-response.png`: `5623a97910649738637256b38435476f3bd59df6410c91deff00aa034edce9e2`;
  - `mobile-chat.png`: `c8f437e468e087483b04d7a9e636116bd5c92aeb8334b210d880f282a6ddad49`.
- Every PNG passed its IHDR dimension assertion and was reviewed at original resolution for privacy, layout, fonts, icons, overlays, rich renderers, and fallback UI. A separate design review approved the final mobile framing and the full gallery.
- With `PLAYWRIGHT_BROWSERS_PATH` pointed at an empty directory, the command exited non-zero and printed Playwright's executable-not-found and browser-install guidance without approving stale output.
- The production build passed at 4.71 MB, above the documented 4.5 MB warning threshold but below the 5 MB error threshold. The full ChromeHeadless suite reached 93/94; the sole failure is the unchanged `SystemPromptRepository` current-localStorage migration test, outside LAC-027. Host WSL has no Node binary, so reproducible generation and browser verification used the documented matching Docker image.
