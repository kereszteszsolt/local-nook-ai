# Ollama integration

## Current contract

Browser communication uses the official `ollama` package through the `ollama/browser` entry point.

```mermaid
sequenceDiagram
    participant UI as Angular UI
    participant F as ChatFacade
    participant A as OllamaClientService
    participant S as ollama/browser
    participant O as Local Ollama

    UI->>F: sendChatMessage(content, think)
    F->>F: build model context
    F->>A: streamChat(request)
    A->>S: chat({ stream: true })
    S->>O: local API request
    O-->>S: streamed parts
    loop response stream
      S-->>A: ChatResponse part
      A-->>F: application chunk
      F-->>UI: partial signals
    end
    F->>F: store completed assistant message
```

## Boundary responsibilities

`OllamaClientService`:

- lists available models;
- maps application messages to SDK messages;
- starts streamed chat requests;
- maps content, thinking output, completion state, and duration;
- tracks one active stream and cancels it through the dedicated SDK client.

`ChatFacade`:

- validates that a model is selected;
- owns loading, partial response, partial thinking, and error signals;
- appends the user message only when a request can start;
- stores a completed assistant message after a successful non-empty stream;
- prevents regeneration from duplicating the original user message;
- clears partial state after completion, failure, or cancellation.

## Runtime configuration

`src/app/core/config/ollama.config.ts` owns the injectable browser-runtime host. It is intentionally separate from product branding and browser-storage identifiers.

The safe default is `http://localhost:11434`. Override it for the current page load with the `ollamaHost` query parameter:

```text
http://localhost:4200/?ollamaHost=http%3A%2F%2F127.0.0.1%3A11435
```

The override must be an absolute `http` or `https` origin. Credentials, paths, query strings, and fragments are rejected, and accepted values are normalized to their URL origin. An invalid explicit override produces recoverable guidance before an SDK client is created.

For browser access, the Ollama installation must permit the LocalNook page origin. Configure `OLLAMA_ORIGINS` for the exact application origin, such as `http://localhost:4200` for host development or `http://127.0.0.1:4201` for the production Compose application, then restart Ollama. A remote or LAN endpoint must also bind to a browser-reachable interface through `OLLAMA_HOST` or a correctly configured proxy; expose it only on a trusted network. The [official Ollama FAQ](https://docs.ollama.com/faq) documents host binding, additional origins, and platform-specific environment configuration.

A browser reports offline, unreachable-host, and blocked-origin failures through similar fetch errors. LocalNook therefore shows one actionable message: start Ollama, confirm the configured endpoint, and check `OLLAMA_ORIGINS`. Specific SDK errors such as a missing model remain unchanged.

## Existing-host startup

Confirm that Ollama is available and that at least one completion model is installed:

```bash
ollama list
ollama pull <model-name>
```

Then start LocalNook:

```bash
npm ci
npm start
```

The [official CLI reference](https://docs.ollama.com/cli) covers model and server commands. The [official JavaScript client](https://github.com/ollama/ollama-js) documents the `ollama/browser` entry point, custom host, async streaming, and abort behavior used by the adapter.

## Containerized startup

The base Compose file serves the production LocalNook build at `http://127.0.0.1:4201` and keeps the existing host Ollama path. Start it with:

```bash
docker compose up --build
```

The optional overlay adds the official pinned Ollama image on loopback host port `11435`. Always name both Compose files for every overlay operation:

```bash
docker compose -f docker-compose.yaml -f docker-compose.ollama.yml up --build
docker compose -f docker-compose.yaml -f docker-compose.ollama.yml exec ollama ollama pull <model-name>
```

No model is pulled during image build or container startup. Open the application with the published browser endpoint:

```text
http://127.0.0.1:4201/?ollamaHost=http%3A%2F%2F127.0.0.1%3A11435
```

The overlay sets `OLLAMA_ORIGINS=http://127.0.0.1:4201` to add the intended LocalNook page origin without claiming that Ollama's built-in origins become exclusive. It stores models in the `ollama-models` named volume. The default is CPU-only; GPU-vendor configuration is out of scope.

Normal shutdown preserves downloaded models:

```bash
docker compose -f docker-compose.yaml -f docker-compose.ollama.yml down
```

Only use the next command for an intentional permanent model-data reset because it removes the named volume:

```bash
docker compose -f docker-compose.yaml -f docker-compose.ollama.yml down --volumes
```

See the [official Ollama Docker guide](https://docs.ollama.com/docker), [Ollama FAQ](https://docs.ollama.com/faq), and [Docker Compose merge documentation](https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/).

## WSL boundary

During LAC-025 on the implementation workstation, WSL2 reached the Ollama API at `http://localhost:11434`; an origin probe for the then-running `http://localhost:4201` development endpoint received an allow-origin response, and a direct completion request succeeded. LAC-026 replaces that Docker development endpoint with the production Compose origin `http://127.0.0.1:4201`. The Ollama CLI was not available on the tested WSL or Windows command paths, so the existing-host CLI workflow is based on the official CLI contract rather than a local CLI run.

This result is specific to that workstation and does not establish a universal hostname across WSL networking modes. Do not assume a gateway: configure `ollamaHost` with an origin the target browser can reach and set `OLLAMA_ORIGINS` for the page origin.

## Testing

The SDK is injected through `OLLAMA_BROWSER_CLIENT_FACTORY`, allowing unit tests to provide a fake client and fake async stream. Required unit tests do not depend on a running Ollama server.
