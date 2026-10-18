# Brand configuration

The display brand is **LocalNook**, and the extended product name is **LocalNook AI**. The repository identity is `localnook-ai`; Ollama remains the separate model provider/runtime name.

The related technical identities are deliberate and do not need to match character-for-character:

- npm package: `@localnook/app`;
- Angular application ID: `localnook-ai`;
- Docker Compose project: `localnook`;
- stable story prefix: `LAC-`.

The repository identity does not rewrite an existing Git remote. Maintainers may update a hosting slug separately when they explicitly intend to change that external repository setting.

## Source of truth

`brand/branding.json` is the canonical metadata source, following the [shared contract](../brand/README.md). `src/app/core/config/brand.config.ts` maps it to the existing injectable interface:

The injectable `BrandConfig` exposes product names, tagline, description, repository identity, project website/source URL, local favicon/icon/poster URLs, license label/URL and developer metadata (name, website/domain, languages, GitHub and support URLs). Its [typed definition](../src/app/core/config/brand.config.ts) is the adapter contract.

The default config contains:

- product name: `LocalNook`;
- extended product name: `LocalNook AI`;
- repository name: `localnook-ai`;
- developer: Keresztes Zsolt;
- website: `https://kereszteszsolt.hu`.

The browser title, favicon, toolbar name/icon, About dialog and sidebar attribution consume this configuration. The static
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

The JSON asset paths are relative to `brand/`. Angular copies `brand/assets` to `brand/assets` in both builds and tests; the Docker build includes the source directory. The adapter maps `appFavicon` to a base-relative browser URL, and the app applies it alongside the title. Empty values disable the SVG favicon. The existing ICO fallback stays in `public/`. The existing poster is displayed in About and the icon in the toolbar; optional empty paths omit those images. Asset paths must remain inside `brand/assets/`.

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
