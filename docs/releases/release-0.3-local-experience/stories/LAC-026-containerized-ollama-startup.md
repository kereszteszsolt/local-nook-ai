# LAC-026: Containerized Ollama startup

## Status

Implemented

## User story

As a local user, I want an optional Compose mode with a dedicated Ollama container so that I can run the complete local experience without replacing the simpler existing-host workflow.

## Context

At the start of this story, the Compose stack served Angular through its development server and had no Ollama service. Browser code still had to receive a host-reachable endpoint rather than a Docker-only service hostname.

## Scope

Create a production application image and an optional Ollama Compose overlay while keeping the base external-Ollama mode clear and preserving local model data in a named volume.

## Acceptance criteria

- [x] Start the production LocalNook application for an existing host Ollama with `docker compose up --build`.
- [x] Start LocalNook with a dedicated Ollama service by combining the base Compose file with `docker-compose.ollama.yml`.
- [x] Build the Angular application in a multi-stage production image and serve static assets with SPA fallback instead of the Angular development server.
- [x] Use the official Ollama image in a separate service with a persistent named model volume.
- [x] Use Docker Compose project name `localnook` and avoid fixed `container_name` values.
- [x] Publish the containerized Ollama endpoint on non-conflicting host port `11435` and give browser code a browser-reachable host URL.
- [x] Do not download a large model automatically during image build or container startup.
- [x] Configure the containerized runtime for the actual LocalNook browser origin without weakening unrelated origins.
- [x] Validate both Compose configurations with `docker compose config` and document exact startup, model-pull, shutdown, and data-retention behavior.
- [x] Verify a production-image HTTP smoke test and report any build-budget, Docker, GPU, or runtime limitations honestly.

## Verification

- Base and merged `docker compose config --quiet` passed with project name `localnook`, no fixed container names, application port `127.0.0.1:4201 -> 8080`, Ollama port `127.0.0.1:11435 -> 11434`, and volume `localnook_ollama-models`.
- The pinned multi-stage image built successfully with Node 22.23.2 and Nginx 1.30.4. The initial production bundle was 4.69 MB raw and 967.28 kB estimated transfer size; it emitted the documented 4.5 MB warning and remained below the 5 MB error threshold.
- `nginx -t` passed. The 69,571,810-byte runtime image contained the production files and no Node binary; both `/` and a deep route returned the same SPA document with `200 OK`.
- `index.html` returned `no-store`, a hashed application asset returned one-year immutable caching, and unhashed favicon and Prism assets returned `no-cache`.
- The base production UI discovered the real host `llama3.1:8b` model. The overlay API returned an empty model list with `Access-Control-Allow-Origin: http://127.0.0.1:4201`, and the UI showed the recoverable no-model state through the encoded `ollamaHost` URL.
- Normal two-file `down` removed the services and retained `localnook_ollama-models`; the destructive `down --volumes` path was documented but intentionally not executed. The base production application was restored healthy after the lifecycle test.
- Full ChromeHeadless suite: 93/94 passed. The sole failure is the unchanged `SystemPromptRepository` current-localStorage migration test; LAC-026 does not modify application storage.
- No containerized model was downloaded, so containerized completion/streaming was not exercised. The overlay is CPU-only and GPU-vendor setup remains out of scope. The unused anonymous `node_modules` volume from the replaced development container was preserved rather than deleted.

## Out of scope

Automatic model selection or download, Kubernetes, GPU-vendor-specific orchestration, hosted deployment, and removal of the existing-host Ollama mode are excluded.

## Implementation evidence

- `Dockerfile` now builds Angular in a pinned Node stage and copies only the production browser output into a pinned Nginx runtime.
- `nginx/default.conf` provides SPA fallback, narrow security headers, no-store HTML, and immutable caching only for content-hashed assets.
- The base Compose file runs the production application independently of Ollama. The optional overlay adds the digest-pinned official Ollama 0.32.0 image, exact LocalNook origin, loopback port, healthcheck, and persistent named model volume without downloading a model.
- Development and integration documentation provides exact base and two-file overlay startup, explicit model pull, shutdown, endpoint, data-retention, and permanent-deletion commands.
