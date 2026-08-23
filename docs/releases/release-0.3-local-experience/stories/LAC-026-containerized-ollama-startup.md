# LAC-026: Containerized Ollama startup

## Status

Planned

## User story

As a local user, I want an optional Compose mode with a dedicated Ollama container so that I can run the complete local experience without replacing the simpler existing-host workflow.

## Context

The current Compose stack serves Angular through its development server and has no Ollama service. Browser code must receive a host-reachable endpoint rather than a Docker-only service hostname.

## Scope

Create a production application image and an optional Ollama Compose overlay while keeping the base external-Ollama mode clear and preserving local model data in a named volume.

## Acceptance criteria

- [ ] Start the production LocalNook application for an existing host Ollama with `docker compose up --build`.
- [ ] Start LocalNook with a dedicated Ollama service by combining the base Compose file with `docker-compose.ollama.yml`.
- [ ] Build the Angular application in a multi-stage production image and serve static assets with SPA fallback instead of the Angular development server.
- [ ] Use the official Ollama image in a separate service with a persistent named model volume.
- [ ] Use Docker Compose project name `localnook` and avoid fixed `container_name` values.
- [ ] Publish the containerized Ollama endpoint on non-conflicting host port `11435` and give browser code a browser-reachable host URL.
- [ ] Do not download a large model automatically during image build or container startup.
- [ ] Configure the containerized runtime for the actual LocalNook browser origin without weakening unrelated origins.
- [ ] Validate both Compose configurations with `docker compose config` and document exact startup, model-pull, shutdown, and data-retention behavior.
- [ ] Verify a production-image HTTP smoke test and report any build-budget, Docker, GPU, or runtime limitations honestly.

## Verification

Validate the base and overlay Compose configurations, build the production image, inspect resolved services/ports/volumes, run an HTTP smoke test, and exercise the browser-to-Ollama path when the environment permits.

## Out of scope

Automatic model selection or download, Kubernetes, GPU-vendor-specific orchestration, hosted deployment, and removal of the existing-host Ollama mode are excluded.

## Implementation evidence

None recorded in this planning commit. Evidence will be added during LAC-026 implementation.
