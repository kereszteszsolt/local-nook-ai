# Brand configuration

The full app name is **LocalNook AI**, defined once by `appName`. The repository identity is `local-nook-ai`; Ollama remains the separate model provider/runtime name.

The related technical identities are deliberate and do not need to match character-for-character:

- npm package: `@localnook/app`;
- Angular application ID: `localnook-ai`;
- Docker Compose project: `local-nook-ai`;
- stable story prefix: `LAC-`.

The repository identity does not rewrite an existing Git remote. Maintainers may update a hosting slug separately when they explicitly intend to change that external repository setting.

## Source of truth

`brand/branding.json` is the canonical metadata source, following the [shared contract](../brand/README.md). `src/app/core/config/app-info.config.ts` maps it to the existing injectable interface:

The injectable `AppInfoConfig` exposes the single product name, tagline, description, support remark, project website/source URL, local favicon/icon/poster URLs and developer metadata (name, website/domain, languages, GitHub and support URLs). Its [typed definition](../src/app/core/config/app-info.config.ts) is the adapter contract. The attribution component defines the Apache-2.0 label and license URL directly.

The default config contains:

- product name: `LocalNook AI`;
- support remark: the configured `supportRemarkText`;
- developer: Keresztes Zsolt;
- website: `https://kereszteszsolt.hu`.

The browser title, favicon, toolbar name/icon, About dialog, sidebar attribution, built-in prompt instructions, prompt-settings labels and restore-error messages consume this configuration. The instructions use the default brand at build time; components and the facade use the injected brand. The About support note also reads `supportRemarkText` from this configuration and starts each sentence on its own line. Documentation uses the exact `LocalNook AI` spelling from the same metadata. Technical project identities are not part of the brand JSON. The static
HTML title is deliberately brand-neutral so it does not create a second product-name source of
truth before Angular bootstraps.

## Rename rule

A display rename should normally require changing `brand/branding.json`, then updating documentation and any deliberate marketing copy. The package, Angular application, Compose project, and repository identities are separate technical decisions. A display rename must not rename:

- the `LAC-*` story IDs;
- localStorage keys;
- IndexedDB database or store identifiers, including `local-ai-client.conversations` and `local-ai-client.system-prompts`;
- stable record identifiers, including `localnook.rich-response-formats.v1`;
- the Ollama provider name or endpoint;
- Angular selectors solely for cosmetic consistency.

This prevents a rebrand from losing local user data or creating a wide mechanical diff.

## Separation from runtime configuration

`OllamaRuntimeConfig` owns the host, currently `http://localhost:11434`. Brand configuration contains no host, credentials, machine-specific value, or secret.

## Local assets

The JSON asset paths are relative to `brand/`. Angular copies `brand/assets` to `app-assets/assets` in both builds and tests; the Docker build includes the source directory. The adapter maps `appFavicon` to a base-relative browser URL, and the app applies it alongside the title. Empty values disable the SVG favicon. The root `public/favicon.ico` fallback is generated from the SVG selected by `appFavicon`, rather than retaining the Angular template icon. Run `node scripts/generate-favicon.mjs` after changing that SVG; it uses the installed Playwright Chromium. HTML declares only the scalable SVG icon, so a competing ICO link cannot override it. The existing poster is displayed in About and the icon in the toolbar; optional empty paths omit those images. Asset paths must remain inside `brand/assets/`.

## Initial migration verification — 2026-10-18

- `npm run build`: production build passed in an isolated Linux copy using Node 24.18.0 and the committed lockfile. The 4.71 MB initial bundle exceeded the 4.50 MB warning threshold; it stayed below the 5 MB error threshold.
- `npm test -- --watch=false --browsers=ChromeHeadless --include=src/app/app.spec.ts --include=src/app/shared/components/nav/nav.component.spec.ts`: 7 tests passed, including injected title/favicon, empty favicon and toolbar branding.
- Isolated Chromium check of the production build: configured title, favicon and SVG poster resolved; no uncaught page errors. Ollama model discovery used an empty synthetic response; no live model was used.
- Local asset references, unchanged source-image bytes and `git diff --check` were checked. Docker COPY paths were updated and reviewed; at that initial checkpoint, no container rebuild or hosted deployment had been run.

## About and redeployment verification — 2026-10-18 (historical LAN checkpoint)

- `npm run build`: passed in an isolated Linux copy using Node 24.18.0 and dependencies verified against the current lockfile. The original checkout has no `node_modules`. The production bundle is 4.72 MB: above the existing 4.50 MB warning threshold and below the 5 MB error threshold.
- Focused `npm test -- --watch=false --browsers=ChromeHeadless --include=src/app/app.spec.ts --include=src/app/shared/components/nav/nav.component.spec.ts --include=src/app/shared/components/about/about.component.spec.ts --include=src/app/features/chat/pages/chat-page/chat-page.component.spec.ts`: 16 passed. Full `npm test -- --watch=false --browsers=ChromeHeadless`: 99 passed. Both used the installed Chromium via `CHROME_BIN` and its local Linux library path.
- `npm run screenshots`: all 7 Playwright checks passed on three complete runs, including the new About keyboard/focus, Escape priority, destination, draft-preservation and mobile checks. Repeated PNG hashes differed; the desktop About comparison isolated four pixels differing by a single shade step at a rounded background sidebar corner. Some existing mobile/rich captures also differed in one run. Byte-identical reproduction is not claimed; the repository's five gallery assets were preserved. About captures are per-test artifacts under ignored `e2e/test-output/screenshots/`.
- `docker compose config --quiet` and `docker compose -f docker-compose.yaml -f docker-compose.ollama.yml config --quiet`: passed. `git -c core.whitespace=cr-at-eol diff --check`: passed.
- `docker compose build angular-app` and `docker compose up -d --force-recreate --no-deps --wait angular-app`: passed from this checkout, using the Dockerfile's Node 22 build stage. At this checkpoint, `localnook-angular-app-1` was healthy and used image `sha256:9074be23d28c574e105b6f91d6a7146e1a6f6c533a8c875e01b85d44519762ba`, published on `0.0.0.0:33060`. No application backend was added.
- Before deployment, port 33060 was absent from Linux/Windows listeners, running Docker mappings and inspected sibling Compose files. After deployment, HTTP requests returned 200 via Linux loopback/WSL interface and Windows `localhost`/LAN address `192.168.1.128`. No independent remote device or public-internet connection was tested.
- A fresh Chromium context against the deployed container verified title, favicon bytes, existing poster, support-button styling, keyboard tooltip/Escape and no horizontal overflow at 1440×1024, 390×844 and 320×720, with no uncaught page errors. Live local Ollama model discovery succeeded; no model generation was requested. The independently managed Ollama runtime returns 403 for the LAN page origin `http://192.168.1.128:33060`; this recorded LAN checkpoint has since been superseded by the [local-only configuration](user-guide.md#local-only-access).
- Original brand artwork, technical/storage identifiers, IndexedDB data and the checked dependency lockfile were preserved. The port change creates a separate browser origin; existing browser history remains under the previous origin. Existing unrelated working-tree changes were retained; no commit or push was made.

## Local-only deployment verification — 2026-10-18

- The application publishes only `127.0.0.1:33060:8080`. The optional Ollama overlay still publishes only `127.0.0.1:11435:11434`, and now explicitly allows the local application origins `http://127.0.0.1:33060` and `http://localhost:33060`; the LAN-origin override was removed.
- Both Compose configurations passed `docker compose config --quiet`; resolved JSON checks confirmed loopback binding on every published port. This change affects deployment configuration and documentation, so no Angular build, unit-test or screenshot rerun was needed.
- Recreated the existing application container with `docker compose up -d --no-build --force-recreate --no-deps --wait angular-app`. The initial start hit a transient Docker forwarding 500 while releasing the previous binding; `docker compose up -d --no-build --no-deps --wait angular-app` then succeeded. The container is healthy, reuses the existing image and publishes only `127.0.0.1:33060` according to Docker inspect and the host listener.
- HTTP returned 200 via Linux `127.0.0.1:33060` and Windows `localhost:33060`. Requests to WSL `192.168.104.141:33060` and Windows LAN `192.168.1.128:33060` failed, confirming the previous non-loopback access is gone from these host checks. No independent remote-device test was performed.
- Only the LocalNook application container ID changed. The separately managed Ollama runtime and other application containers were retained. Existing staged changes were preserved; no commit or push was made.

## Favicon, tooltip and About backdrop verification — 2026-10-19

- Replaced the Angular template `public/favicon.ico` with a 16/32/48/64 px ICO generated from the unchanged SVG selected by `brand/branding.json`. Removed the competing alternate-icon declaration; the single configured SVG icon declares `sizes="any"`. `node scripts/generate-favicon.mjs` reproduces the fallback without changing the source artwork.
- Brand tooltip bubbles can grow to 560 px while remaining viewport-bounded. Desktop destination descriptions, including all four language codes and the complete coffee sentence, fit on one line with the URL below. About uses its own 4 px blurred backdrop. Its 8 px horizontal viewport margin matches Material tooltip placement; this also fixes a clipped tooltip closing immediately on mobile.
- `npm run build` passed in an isolated Linux copy with matching lockfile dependencies. The initial bundle remains 4.72 MB, above the existing 4.50 MB warning threshold and below the 5 MB error threshold.
- `npm test -- --watch=false --browsers=ChromeHeadless --include=src/app/app.spec.ts --include=src/app/shared/components/nav/nav.component.spec.ts`: 8 passed. `npm run screenshots -- --grep branding`: all 3 focused Playwright checks passed, including exact pixel equivalence of the ICO's 32 px frame and configured SVG, one-line desktop descriptions, mobile tooltip bounds, blur, focus/Escape and preserved draft behavior.
- The same 3 browser checks also passed against the redeployed production container using isolated browser contexts and synthetic Ollama responses. Reviewed desktop support/coffee tooltip and mobile About screenshots are test artifacts; the existing five gallery images were preserved. Live model generation was not exercised.
- `docker compose build angular-app` and `docker compose up -d --no-build --force-recreate --no-deps --wait angular-app` succeeded. The healthy container uses image `sha256:e859e589fb1d94207172902a4e220e998d15188adb8b6f0a6596c57024b0acb5`, serves byte-identical generated ICO content and remains bound only to `127.0.0.1:33060`. `git -c core.whitespace=cr-at-eol diff --check` passed.

## 2026-10-19 — Function-based consumer names and one root metadata source

The user explicitly limited this naming cleanup to CiteNook, ContestCheck, OpenNook, LocalNook, StonePlan and StoryCheck. Root `brand/` is the editable data/artwork source; consuming modules, components, scripts, styles, tests and guides use their function. The rule is recorded in `AGENTS.md`. The six source catalogs and all artwork were checked by SHA-256 against the task-start snapshot (25 JSON/artwork files unchanged). Existing unrelated pending changes and historical result fixtures were retained. No commit or push was requested.

Renamed the injectable consumer to `app-info.config.ts` / `AppInfoConfig`, attribution to `author-attribution` / `AuthorAttributionComponent`, and the browser spec to `about.spec.ts`. Public asset copies use `app-assets/assets`; the editable input remains the unchanged root catalog/artwork. Active guides and LAC-016 links use the new functional names, while story IDs and browser storage identifiers remain intact.

`npm run build` passed with the existing approximately 4.72 MB initial-bundle budget warning. The existing app/nav/About/system-prompt-settings ChromeHeadless suites passed 13 tests in a network-disabled browser-tools container. `node node_modules/@playwright/test/cli.js test --config=playwright.screenshots.config.ts e2e/screenshots/about.spec.ts` passed all three fixture-based About/favicon/mobile cases using its temporary dev server. Original tracked screenshots are unchanged. The Docker image was rebuilt and its copied artwork hashes verified. Because the original app was stopped, `docker compose -f docker-compose.yaml create --no-build angular-app` prepared a fresh stopped container without starting it; the next manual start uses the new image. No Ollama container was started.

Cross-repository proof: **540 unit/API tests and 56 browser cases/scenarios passed**. Scoped filename/local-link/whitespace checks and the deployed source/asset/container audit passed. Local helper scripts, build/deploy logs, summaries and captures remain under `/tmp/app-ui-naming/`; they are not committed. Database containers and named mounts were preserved; untouched services retained their original policies. No live/paid model generation, new indexing or submitted-code execution was run. Hosted CI/public deployment and other browser engines were not tested.
