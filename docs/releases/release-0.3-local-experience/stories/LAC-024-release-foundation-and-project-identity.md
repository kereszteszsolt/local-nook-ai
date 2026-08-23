# LAC-024: Release foundation and project identity

## Status

Planned

## User story

As a maintainer, I want one coherent LocalNook identity and a bounded Release 0.3 workflow so that package, application, container, documentation, and AI-assisted engineering metadata describe the same project without breaking browser-local data.

## Context

The display brand is already LocalNook, but legacy technical names remain in package, Angular, Docker, BrandConfig, and documentation contracts. Historical LAC identifiers and browser-storage identifiers must remain stable.

## Scope

Establish the Release 0.3 evidence structure, apply the approved identity contract to relevant technical and presentation surfaces, preserve storage compatibility, and keep the repository agent and skill setup focused.

## Acceptance criteria

- [ ] Use `LocalNook` as the display brand and `LocalNook AI` as the extended product name.
- [ ] Use `localnook-ai` as the repository identity, `@localnook/app` as the package name, and `localnook-ai` as the Angular application ID.
- [ ] Use `localnook` as the Docker Compose project name without changing Git remotes automatically.
- [ ] Keep a typed central `BrandConfig` for product and developer metadata and update its focused consumers and tests.
- [ ] Preserve all existing browser-storage database names, store names, keys, migrations, and stable record identifiers independently from the display brand.
- [ ] Update `docs/brand-configuration.md` and other directly affected identity documentation to describe the implemented contract accurately.
- [ ] Record the story-start and commit-approval workflow in `AGENTS.md` and `.codex/README.md`.
- [ ] Keep exactly four focused custom agents: architect, implementation_worker, reviewer, and design_reviewer.
- [ ] Keep exactly five focused repository skills: angular-feature-delivery, ollama-integration, conversation-context, ui-design, and release-evidence.
- [ ] Verify package/lock consistency, Angular target references, Docker project naming, BrandConfig behavior, stable storage identifiers, and the absence of unintended semantic changes.

## Verification

Inspect identity and storage constants, run focused BrandConfig tests, validate the package lock and Angular targets, run the required build/test commands, validate Compose configuration, and review the semantic Git diff and status.

## Out of scope

Git remote changes, storage-key renames, IndexedDB schema migrations, broad dependency upgrades, UI redesign, and changes to the Ollama transport boundary are excluded.

## Implementation evidence

None recorded in this planning commit. Evidence will be added during LAC-024 implementation.
