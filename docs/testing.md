# Testing

## Required commands

```bash
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

## Current focused coverage

- `ChatContextBuilder`: active prompt ordering, narrow model fields, and empty/system-history filtering.
- `OllamaClientService`: official model mapping, streamed content/thinking/duration, and client cancellation.
- `ChatFacade`: selected-model guard, persisted active/conversation model and thinking-toggle selection, fallback, completed response storage, thinking-only completion rejection, regeneration without duplicate user messages, and stale-chunk isolation after abort.
- `ConversationRepository`: schema migration, message order, metadata-only model/thinking updates, and active-record cleanup.
- `ActiveModelRepository`: browser-local active model persistence.
- `SystemPromptRepository`: malformed data, entry validation, and legacy-key migration.
- `ChatInputComponent`: typed composer event instead of serialized component payloads.
- `SystemPromptSettingsComponent`: quoted CSV fields and JSON import validation.
- `ChatMessageComponent`: regeneration ID routing and non-blocking clipboard failure feedback.
- `App` and `NavComponent`: BrandConfig browser/title usage and model loading/selection.

## Test boundaries

Unit tests replace the injected Ollama SDK client; they must not require a live model server. Manual smoke testing covers actual browser origin configuration, local model availability, real streaming, cancellation latency, and rendering with representative content.

## Planned persistence coverage

LAC-010 and LAC-011 should add deterministic IndexedDB tests for create/list/open, append, reload recovery, delete-one, delete-all, schema migration, and failure recovery. Context tests must prove that one conversation never contributes messages to another.

Do not keep tests that only instantiate a class when a meaningful behavior can be asserted instead.

## Deterministic product screenshots

The screenshot gallery is generated from five independent Playwright tests with fresh browser contexts. The tests use fixed time, UTC timezone, `en-US` locale, light color scheme, reduced motion, fixed viewports, device scale factor `1`, self-hosted Roboto and Material Icons fonts, and disabled animations, transitions, smooth scrolling, and carets.

### Native prerequisites and generation

Use Node.js 22 and install the repository lockfile plus the pinned Chromium browser:

```bash
npm ci
npx playwright install chromium
npm run screenshots
```

`npm run screenshots` starts its own Angular server on `127.0.0.1:4202` and refuses to reuse an already running server. It overwrites these stable targets under `docs/screenshots/`:

- `desktop-chat.png` — 1440 × 900;
- `model-selection.png` — 1440 × 1024;
- `system-prompts.png` — 1440 × 1024;
- `rich-response.png` — 1440 × 1200;
- `mobile-chat.png` — 390 × 844.

Each test reads the generated PNG IHDR and fails unless its dimensions match exactly. If the pinned browser executable is unavailable, Playwright must fail instead of silently using another browser; install Chromium as shown above or use the matching container fallback. Do not approve partial or stale output from a failed run.

The missing-browser failure path can be checked explicitly with an empty browser directory:

```bash
PLAYWRIGHT_BROWSERS_PATH=/tmp/localnook-no-browsers npm run screenshots
```

The command must exit non-zero and print Playwright's browser installation guidance.

### Matching Docker fallback

When host Node or Chromium is unavailable, run the exact Playwright image matching `@playwright/test`:

```bash
docker run --rm --ipc=host \
  -v "$PWD":/work \
  -v /work/node_modules \
  -w /work \
  mcr.microsoft.com/playwright:v1.62.1-noble \
  sh -lc 'npm ci && npm run screenshots'
```

The anonymous `/work/node_modules` volume prevents container dependencies from replacing host dependencies. Docker may need to download the pinned image on the first run.

### Fixture and privacy boundary

The application is opened with this test-only runtime endpoint:

```text
ollamaHost=http%3A%2F%2Flocalnook-screenshot.invalid
```

Playwright intercepts only exact Ollama fixture operations: `GET /api/tags`, allowed CORS `OPTIONS`, and `POST /api/chat`. Responses are deterministic valid Ollama JSON or NDJSON. Application-origin assets continue to the dedicated local server; every unexpected external HTTP request is recorded and aborted. Service workers are blocked, all fonts are repository-local, and the rich response test waits for Prism tokens, KaTeX, Mermaid SVG, and Vega SVG while rejecting chart fallback alerts.

Playwright creates a fresh isolated context for every screenshot. The tests neither open a persistent profile nor read an existing IndexedDB/localStorage database, and their fixed content contains no names, credentials, machine paths, real prompts, or conversation text.

### Determinism and review

Generate twice and compare sorted SHA-256 output:

```bash
npm run screenshots
sha256sum docs/screenshots/*.png | sort > /tmp/localnook-screenshots-first.sha256
npm run screenshots
sha256sum docs/screenshots/*.png | sort > /tmp/localnook-screenshots-second.sha256
diff -u /tmp/localnook-screenshots-first.sha256 /tmp/localnook-screenshots-second.sha256
```

An empty `diff` confirms identical bytes for that pinned environment. Before accepting updated images, inspect every PNG at full size and confirm expected layout, readable local fonts, correct model/prompt overlays, all rich renderers, no fallback alert, no private content, and the exact dimensions listed in [`docs/screenshots/README.md`](screenshots/README.md).

Screenshot generation is a maintainer workflow, not a CI or visual-regression gate. Browser/OS rendering changes must be reviewed explicitly rather than hidden behind automatic baseline updates.
