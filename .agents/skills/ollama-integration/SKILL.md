---
name: ollama-integration
description: Change LocalNook communication with Ollama. Use for model listing, chat requests, streaming chunks, thinking output, cancellation, runtime host configuration, SDK mapping, and Ollama-specific errors.
---

# Ollama integration

Read `references/official-client.md` before transport changes.

1. Confirm version-sensitive behavior against official Ollama documentation.
2. Use the official `ollama/browser` entry point in browser code.
3. Keep SDK calls behind `OllamaClientService`; components and templates never call the SDK.
4. Keep the local host in `OllamaRuntimeConfig`, separate from `BrandConfig`.
5. Map application messages to the narrow SDK request shape intentionally.
6. Consume streaming responses with `for await` and maintain one clear lifecycle.
7. Abort through the dedicated official SDK client and leave facade state consistent.
8. Store an assistant message only after successful completion with actual content.
9. Map connection, model, stream, and abort outcomes into explicit application behavior.
10. Unit-test the adapter with a fake SDK client; keep live-server smoke testing optional.
11. Remove obsolete custom transport code when the SDK path replaces it.

Avoid another generic HTTP layer, app-owned wire parsing, and provider calls from UI components.
