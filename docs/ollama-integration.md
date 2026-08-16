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

`src/app/core/config/ollama.config.ts` contains a small injectable host config. It is intentionally separate from product branding.

For browser access, the local Ollama installation must permit the application's origin. This is an environment concern, not a reason to reintroduce a custom transport layer.

## Testing

The SDK is injected through `OLLAMA_BROWSER_CLIENT_FACTORY`, allowing unit tests to provide a fake client and fake async stream. Required unit tests do not depend on a running Ollama server.
