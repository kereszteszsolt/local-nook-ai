# Development

## Prerequisites

- Node.js 22
- npm
- a local Ollama installation for manual integration testing

## Setup

```bash
npm ci
npm start
```

The application runs at `http://localhost:4200` and connects to Ollama at `http://localhost:11434` by default.

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
