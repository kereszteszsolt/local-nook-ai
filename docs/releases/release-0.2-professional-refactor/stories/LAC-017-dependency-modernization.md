# LAC-017: Modernize library versions deliberately

## Status

Planned

## User story

As a maintainer, I want a controlled dependency update so that the project stays on supported compatible versions without hiding migration work inside feature stories.

## Acceptance criteria

- [ ] Inventory direct dependencies and supported target versions at implementation time.
- [ ] Update Angular framework, build, CLI, CDK, and Material packages as a compatible set.
- [ ] Keep TypeScript, RxJS, and Zone.js within the selected Angular compatibility range.
- [ ] Review Tailwind/PostCSS, ngx-markdown, Mermaid, KaTeX, PrismJS, and test tooling for breaking changes.
- [ ] Confirm the official Ollama client version remains compatible with the adapter.
- [ ] Use official migration paths and regenerate the lock file through npm.
- [ ] Run build, test, Docker startup, and a local Ollama smoke test.
- [ ] Document unavoidable migration changes without introducing generic compatibility layers.

## Implementation notes

- Do not use forced major-version audit fixes or add unrelated libraries during this story.

## Verification

Run focused tests for changed behavior, `npm run build`, and `npm test -- --watch=false --browsers=ChromeHeadless`. Report environment-only limitations explicitly.
