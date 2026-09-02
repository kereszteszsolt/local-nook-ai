# LAC-025: External Ollama startup

## Status

Implemented

## User story

As a user with Ollama already installed, I want LocalNook to connect through a clear, configurable local endpoint and explain recoverable startup failures so that I can begin chatting without learning application internals.

## Context

At the start of this story, LocalNook already used the official browser SDK behind an application adapter and defaulted to the local Ollama port. Release 0.3 had to preserve that boundary while making runtime configuration and operational guidance explicit.

## Scope

Harden the existing-host startup path, add a validated browser-reachable endpoint override, improve offline/origin guidance, and document verified local and WSL startup steps.

## Acceptance criteria

- [x] Import `Ollama` from `ollama/browser` and keep all SDK calls behind `OllamaClientService`.
- [x] Preserve the typed `Angular UI -> ChatFacade -> OllamaClientService -> ollama/browser` boundary without manual NDJSON parsing or component-level transport calls.
- [x] Provide a validated runtime endpoint configuration with a safe `http://localhost:11434` default.
- [x] Support an explicit endpoint override without coupling runtime configuration to BrandConfig or browser-storage identifiers.
- [x] Show clear, recoverable guidance when Ollama is offline, unreachable, or blocked by browser-origin configuration.
- [x] Document `ollama list`, `ollama pull <model-name>`, `npm ci`, and `npm start` for the existing-host workflow.
- [x] Document endpoint overrides, browser-origin requirements, and only WSL behavior verified during implementation.
- [x] Keep unit tests independent from a live model by injecting or faking the SDK boundary.
- [x] Verify model discovery, completion-capability filtering, streaming, cancellation, endpoint configuration, and intentional request fields.

## Verification

- Focused runtime-config and fake-SDK adapter suite: 20/20 passed in ChromeHeadless.
- Full ChromeHeadless suite: 93/94 passed. The sole failure is the unchanged `SystemPromptRepository` current-localStorage migration test; LAC-025 does not modify prompt storage.
- Development build passed. The required production build compiled and then failed the pre-existing initial-bundle budget: 4.69 MB against the 1 MB error threshold.
- Source search found no application-owned `fetch`, `HttpClient`, `ReadableStream`, `getReader`, or NDJSON transport path; the only Ollama imports remain `ollama/browser` in configuration and the adapter.
- WSL2 reached `http://localhost:11434`; the `http://localhost:4201` origin probe returned `200 OK` with an allow-origin header, and a direct completion smoke request returned `OK.`. The Ollama CLI was not available on the tested command paths.
- An isolated headless Chrome smoke loaded the real Angular UI through `ollamaHost` and selected the discovered `llama3.1:8b` completion model. No external Ollama configuration was changed.

## Out of scope

Installing or managing the host Ollama runtime from the UI, proxying requests through a new backend, model downloads initiated by LocalNook, and changes to conversation persistence are excluded.

## Implementation evidence

- `resolveOllamaRuntimeConfig` validates and normalizes the optional `ollamaHost` query override while retaining the safe local default and rejecting credentials or non-origin URL parts.
- `OllamaClientService` passes the validated host to the injected official SDK client, preserves model-specific and abort errors, and maps browser network failures to endpoint and `OLLAMA_ORIGINS` recovery guidance.
- Fake-client tests cover configuration, capability filtering, intentional request fields, startup and mid-stream failures, streaming, and cancellation without requiring a live model.
- The development and Ollama integration guides document the existing-host workflow, endpoint and bind requirements, browser origins, and the exact WSL2 evidence boundary.
