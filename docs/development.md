# Development

## Prerequisites

- Node.js 22
- npm
- a local Ollama installation for manual integration testing

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

On the implementation workstation, WSL2 reached the Ollama API at `http://localhost:11434`, and the API allowed the `http://localhost:4201` page origin. The Ollama CLI was not available on the tested WSL or Windows command paths. This is evidence for that workstation only, not a universal WSL hostname rule; use an endpoint confirmed reachable from the target browser.

## Docker

```bash
docker compose up --build
```

The development container uses `npm ci`, the repository-local Angular CLI, and port `4201`. The bind mount supports local editing while the anonymous `node_modules` volume keeps container dependencies inside the container.

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
