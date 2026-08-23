# Development

For application usage rather than repository maintenance, start with the [LocalNook user guide](user-guide.md).

## Prerequisites

- Node.js 22 and npm for native development
- one Ollama mode for manual integration testing: an existing installation, or Docker Engine with Docker Compose for the optional Ollama container

## Setup

Confirm the existing Ollama installation and pull a completion model when needed:

```bash
ollama list
ollama pull <model-name>
```

Install and start LocalNook:

```bash
npm ci
npm start
```

The application runs at `http://localhost:4200` and connects to Ollama at `http://localhost:11434` by default.

To use another browser-reachable Ollama origin for the current page load, open:

```text
http://localhost:4200/?ollamaHost=http%3A%2F%2F127.0.0.1%3A11435
```

`ollamaHost` accepts only an absolute `http` or `https` origin without credentials, a path, query, or fragment. Configure Ollama's `OLLAMA_ORIGINS` for the exact LocalNook page origin and restart Ollama if the browser blocks the request. To reach Ollama through another machine or LAN address, Ollama must also bind to a reachable interface through `OLLAMA_HOST` or sit behind a correctly configured proxy; expose it only on a trusted network. See the [official Ollama FAQ](https://docs.ollama.com/faq), [CLI reference](https://docs.ollama.com/cli), and [JavaScript client](https://github.com/ollama/ollama-js).

During LAC-025, before the current production Compose origin was introduced, the implementation workstation's WSL2 environment reached the Ollama API at `http://localhost:11434`, and the API allowed the then-running `http://localhost:4201` development page origin. Current production Compose uses `http://127.0.0.1:4201`. The Ollama CLI was not available on the tested WSL or Windows command paths. This is historical evidence for that workstation only, not a universal WSL hostname rule; use an endpoint confirmed reachable from the target browser.

## Docker

### Existing host Ollama

Build and start the production LocalNook image while keeping Ollama on the host:

```bash
docker compose up --build
```

Open `http://127.0.0.1:4201`. The browser keeps the default `http://localhost:11434` Ollama endpoint; if the host runtime rejects the page origin, configure its `OLLAMA_ORIGINS` for `http://127.0.0.1:4201` and restart Ollama.

The multi-stage image builds Angular with Node.js and serves only the production output through Nginx on container port `8080`. There is no source bind mount or Angular development server in this path. Stop it with:

```bash
docker compose down
```

### Optional containerized Ollama

Always name both files when using the Ollama overlay:

```bash
docker compose -f docker-compose.yaml -f docker-compose.ollama.yml up --build
```

No model is downloaded automatically. Pull one explicitly after the Ollama service is healthy:

```bash
docker compose -f docker-compose.yaml -f docker-compose.ollama.yml exec ollama ollama pull <model-name>
```

Open LocalNook with the browser-reachable published Ollama endpoint:

```text
http://127.0.0.1:4201/?ollamaHost=http%3A%2F%2F127.0.0.1%3A11435
```

The overlay adds `http://127.0.0.1:4201` through `OLLAMA_ORIGINS`; it does not claim to remove Ollama's built-in allowed origins. The default configuration is CPU-only. GPU-vendor-specific devices, runtimes, and images are intentionally out of scope; see the [official Ollama Docker guide](https://docs.ollama.com/docker) when adding a local vendor-specific override.

Normal shutdown preserves the `ollama-models` named volume and downloaded models:

```bash
docker compose -f docker-compose.yaml -f docker-compose.ollama.yml down
```

The following destructive variant permanently deletes that named volume and its downloaded models. Use it only when intentionally resetting local model data:

```bash
docker compose -f docker-compose.yaml -f docker-compose.ollama.yml down --volumes
```

Docker documents [Compose file merging](https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/) and [`down --volumes`](https://docs.docker.com/reference/cli/docker/compose/down/).

### Production bundle budget

The initial production bundle budget is intentionally calibrated to warn above `4.5MB` and fail above `5MB`; the component-style budget is unchanged. These thresholds are guardrails, not a target size. Use the current `npm run build` output and release evidence for the actual bundle size and image-build result.

## Change workflow

1. Read `AGENTS.md` and the relevant release story.
2. Trace the existing behavior.
3. Use the smallest matching skill or custom agent.
4. Implement a bounded change and focused tests.
5. Run build/tests.
6. Update docs and story status only when the implementation supports it.

## Dependency changes

General library modernization belongs to LAC-017. Keep Angular framework packages compatible as a set, review breaking changes, use official migrations where available, and regenerate `package-lock.json` with npm in a normal connected development environment.

## CI

`.github/workflows/ci.yml` installs with `npm ci`, builds the application, and runs the ChromeHeadless test suite on pushes to `main` and pull requests.
