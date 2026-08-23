# Release 0.3 — Local experience and project presentation

## Status

In progress

Release 0.3 makes LocalNook easier to start, understand, verify, and present without expanding the product into a hosted or backend-heavy system. The repository remains the source of truth for implemented behavior and verification evidence.

| Story | Outcome | Status |
| --- | --- | --- |
| [LAC-024](stories/LAC-024-release-foundation-and-project-identity.md) | Establish the release foundation and canonical project identity | Implemented |
| [LAC-025](stories/LAC-025-external-ollama-startup.md) | Document and harden startup with an existing Ollama runtime | Implemented |
| [LAC-026](stories/LAC-026-containerized-ollama-startup.md) | Add an optional containerized Ollama startup mode | Implemented |
| [LAC-027](stories/LAC-027-reproducible-product-screenshots.md) | Generate deterministic product screenshots | Planned |
| [LAC-028](stories/LAC-028-user-guide.md) | Publish an accurate user guide | Planned |
| [LAC-029](stories/LAC-029-penpot-design-synchronization.md) | Reconcile meaningful UI changes with Penpot | Planned |
| [LAC-030](stories/LAC-030-readme-and-release-presentation.md) | Present the project and release accurately in the README | Planned |

## Delivery order

Stories are implemented in numeric order. The planning commit leaves every acceptance criterion unchecked. Each later story commit updates only that story with implementation and verification evidence, and marks only criteria supported by that evidence.

## Release boundary

This release covers project identity, local startup paths, a production container, deterministic screenshots, user documentation, focused design synchronization, and repository presentation. It does not add hosted services, authentication, telemetry, cloud synchronization, RAG, document ingestion, or model-management automation.
