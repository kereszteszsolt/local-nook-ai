# LAC-017: Modernize library versions deliberately

## Status

Implemented

## User story

As a maintainer, I want a controlled dependency update so that the project stays on supported compatible versions without hiding migration work inside feature stories.

## Acceptance criteria

- [x] Inventory direct dependencies and supported target versions at implementation time.
- [x] Update Angular framework, build, CLI, CDK, and Material packages as a compatible set.
- [x] Keep TypeScript, RxJS, and Zone.js within the selected Angular compatibility range.
- [x] Review Tailwind/PostCSS, ngx-markdown, Mermaid, KaTeX, PrismJS, and test tooling for breaking changes.
- [x] Confirm the official Ollama client version remains compatible with the adapter.
- [x] Use official migration paths and regenerate the lock file through npm.
- [x] Run build, test, Docker startup, and a local Ollama smoke test.
- [x] Document unavoidable migration changes without introducing generic compatibility layers.

## Implementation notes

- Do not use forced major-version audit fixes or add unrelated libraries during this story.

## Verification

Run focused tests for changed behavior, `npm run build`, and `npm test -- --watch=false --browsers=ChromeHeadless`. Report environment-only limitations explicitly.

## Comments

- Angular runtime packages use 20.3.28; CLI/build use 20.3.34; CDK/Material use 20.2.14.
- `ollama` remains at the current official browser-client release, 0.6.3; no adapter migration was needed.
- Docker and local Ollama smoke checks passed; the production bundle budget and missing ChromeHeadless still block final verification.
