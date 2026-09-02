# Release 0.3 — Local experience and project presentation

## Status

Implemented

Release 0.3 makes LocalNook easier to start, understand, verify, and present without expanding the product into a hosted or backend-heavy system. All seven stories are implemented, and the repository remains the source of truth for their behavior, verification evidence, and recorded limitations.

| Story | Outcome | Status |
| --- | --- | --- |
| [LAC-024](stories/LAC-024-release-foundation-and-project-identity.md) | Establish the release foundation and canonical project identity | Implemented |
| [LAC-025](stories/LAC-025-external-ollama-startup.md) | Document and harden startup with an existing Ollama runtime | Implemented |
| [LAC-026](stories/LAC-026-containerized-ollama-startup.md) | Add an optional containerized Ollama startup mode | Implemented |
| [LAC-027](stories/LAC-027-reproducible-product-screenshots.md) | Generate deterministic product screenshots | Implemented |
| [LAC-028](stories/LAC-028-user-guide.md) | Publish an accurate user guide | Implemented |
| [LAC-029](stories/LAC-029-penpot-design-synchronization.md) | Audit Release 0.3 UI against Penpot and document the no-change decision | Implemented |
| [LAC-030](stories/LAC-030-readme-and-release-presentation.md) | Present the project and release accurately in the README | Implemented |

## Delivery order

Stories are implemented in numeric order. The planning commit leaves every acceptance criterion unchecked. Each later story commit updates only that story with implementation and verification evidence, and marks only criteria supported by that evidence.

## Release boundary

This release covers project identity, local startup paths, a production container, deterministic screenshots, user documentation, focused design reconciliation, and repository presentation. It does not add hosted services, authentication, telemetry, cloud synchronization, RAG, document ingestion, or model-management automation.

## Result

LocalNook now has canonical project identities, validated host and optional containerized Ollama startup paths, a production Nginx container, deterministic privacy-safe screenshots, an accurate user guide, reconciled Penpot evidence, and a verified public README. Release 0.3 is a completed repository milestone; it does not claim an external Git tag, hosted release, or published npm package.
