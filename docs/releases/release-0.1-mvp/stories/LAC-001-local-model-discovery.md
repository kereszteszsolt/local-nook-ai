# LAC-001: Discover and select local models

## Status

Implemented

## User story

As a user, I want the application to discover locally available Ollama models and let me select one so that I can choose which local model answers my messages.

## Acceptance criteria

- [x] The model list is requested from the configured local Ollama instance.
- [x] Available models are presented with stable names and identifiers.
- [x] The first available model is selected by default when the previous selection is unavailable.
- [x] The user can change the active model.
- [x] An empty model list or connection failure produces a visible recoverable message.

## Implementation evidence

- `ChatFacade.loadModels()` owns model state and selection.
- `OllamaClientService.listModels()` maps the provider response.
- `NavComponent` renders and changes the selected model.

## Verification

Preserve this behavior through focused unit tests and the repository build/test commands. Use a local Ollama smoke test for the real browser-to-runtime path.
