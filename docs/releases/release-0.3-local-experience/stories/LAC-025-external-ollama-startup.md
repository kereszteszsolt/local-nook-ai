# LAC-025: External Ollama startup

## Status

Planned

## User story

As a user with Ollama already installed, I want LocalNook to connect through a clear, configurable local endpoint and explain recoverable startup failures so that I can begin chatting without learning application internals.

## Context

LocalNook already uses the official browser SDK behind an application adapter and defaults to the local Ollama port. Release 0.3 must preserve that boundary while making runtime configuration and operational guidance explicit.

## Scope

Harden the existing-host startup path, add a validated browser-reachable endpoint override, improve offline/origin guidance, and document verified local and WSL startup steps.

## Acceptance criteria

- [ ] Import `Ollama` from `ollama/browser` and keep all SDK calls behind `OllamaClientService`.
- [ ] Preserve the typed `Angular UI -> ChatFacade -> OllamaClientService -> ollama/browser` boundary without manual NDJSON parsing or component-level transport calls.
- [ ] Provide a validated runtime endpoint configuration with a safe `http://localhost:11434` default.
- [ ] Support an explicit endpoint override without coupling runtime configuration to BrandConfig or browser-storage identifiers.
- [ ] Show clear, recoverable guidance when Ollama is offline, unreachable, or blocked by browser-origin configuration.
- [ ] Document `ollama list`, `ollama pull <model-name>`, `npm ci`, and `npm start` for the existing-host workflow.
- [ ] Document endpoint overrides, browser-origin requirements, and only WSL behavior verified during implementation.
- [ ] Keep unit tests independent from a live model by injecting or faking the SDK boundary.
- [ ] Verify model discovery, completion-capability filtering, streaming, cancellation, endpoint configuration, and intentional request fields.

## Verification

Run focused runtime-config and Ollama adapter tests, search for forbidden transport patterns, run the required build/test commands, and perform a documented local smoke test when the runtime and browser are available.

## Out of scope

Installing or managing the host Ollama runtime from the UI, proxying requests through a new backend, model downloads initiated by LocalNook, and changes to conversation persistence are excluded.

## Implementation evidence

None recorded in this planning commit. Evidence will be added during LAC-025 implementation.
