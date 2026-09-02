# LAC-024: Release foundation and project identity

## Status

Implemented

## User story

As a maintainer, I want one coherent LocalNook identity and a bounded Release 0.3 workflow so that package, application, container, documentation, and AI-assisted engineering metadata describe the same project without breaking browser-local data.

## Context

At the start of this story, the display brand was already LocalNook, but legacy technical names remained in package, Angular, Docker, BrandConfig, and documentation contracts. Historical LAC identifiers and browser-storage identifiers had to remain stable.

## Scope

Establish the Release 0.3 evidence structure, apply the approved identity contract to relevant technical and presentation surfaces, preserve storage compatibility, and keep the repository agent and skill setup focused.

## Acceptance criteria

- [x] Use `LocalNook` as the display brand and `LocalNook AI` as the extended product name.
- [x] Use `localnook-ai` as the repository identity, `@localnook/app` as the package name, and `localnook-ai` as the Angular application ID.
- [x] Use `localnook` as the Docker Compose project name without changing Git remotes automatically.
- [x] Keep a typed central `BrandConfig` for product and developer metadata and update its focused consumers and tests.
- [x] Preserve all existing browser-storage database names, store names, keys, migrations, and stable record identifiers independently from the display brand.
- [x] Update `docs/brand-configuration.md` and other directly affected identity documentation to describe the implemented contract accurately.
- [x] Record the story-start and commit-approval workflow in `AGENTS.md` and `.codex/README.md`.
- [x] Keep exactly four focused custom agents: architect, implementation_worker, reviewer, and design_reviewer.
- [x] Keep exactly five focused repository skills: angular-feature-delivery, ollama-integration, conversation-context, ui-design, and release-evidence.
- [x] Verify package/lock consistency, Angular target references, Docker project naming, BrandConfig behavior, stable storage identifiers, and the absence of unintended semantic changes.

## Verification

- Isolated `npm ci --ignore-scripts` completed with the renamed package and lock file; npm reported the existing dependency audit findings separately.
- `docker compose config --quiet` passed and resolves project name `localnook`.
- The Angular development build passed and emitted `dist/localnook-ai`. At LAC-024 verification time, the production build compiled but failed the then-current 1 MB initial-bundle budget (`4.69 MB` total).
- The focused BrandConfig/App ChromeHeadless suite passed `3/3`. The full suite reached `77/78`; the remaining unchanged `SystemPromptRepository` migration test fails independently of LAC-024.
- Storage repository and Ollama runtime-config hashes, all stable database/key/record identifiers, ports, Angular selector prefix, and Git remote remained unchanged.
- Semantic diff review was limited to the LAC-024 identity, workflow, and evidence files; the pre-existing CRLF-only working-tree changes remain unmodified.

## Out of scope

Git remote changes, storage-key renames, IndexedDB schema migrations, broad dependency upgrades, UI redesign, and changes to the Ollama transport boundary are excluded.

## Implementation evidence

- Package and lock metadata use `@localnook/app`; the Angular project and build targets use `localnook-ai`; Compose declares project `localnook`.
- `BrandConfig` centrally defines `LocalNook`, `LocalNook AI`, repository identity, tagline, and developer metadata, with focused consumer tests.
- Identity and storage-separation rules are documented in `docs/brand-configuration.md`, while `AGENTS.md` and `.codex/README.md` define explicit story-start and commit-approval checkpoints.
- The existing four custom agents and five repository skills remain the bounded AI-assisted engineering surface.
