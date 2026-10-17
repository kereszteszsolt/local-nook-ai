---
name: ollama-integration
description: Use for LocalNook official ollama/browser SDK requests, model discovery, streaming, abort, thinking output and runtime host configuration.
---

# Ollama browser integration

1. Inspect `OllamaClientService`, `OllamaRuntimeConfig`, focused tests and `references/official-client.md` for version-sensitive SDK behavior.
2. Keep `ollama/browser` transport behind the adapter. Use only supported SDK request fields and explicit streaming with `for await`.
3. Ensure cancellation, connection failure, invalid model and partial stream errors leave `ChatFacade` consistent and do not persist incomplete assistant text.
4. Keep SDK/runtime connection settings independent of `BrandConfig` and IndexedDB storage identity.
5. Prefer mocked SDK tests for repeatability. Real Ollama smoke requires an installed model/runtime and must be reported separately.
6. Do not introduce an app backend, second wire parser or generic cloud-provider abstraction without an approved request.
