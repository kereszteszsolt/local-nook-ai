# LAC-015: Add a focused AI-assisted repository workflow

## Status

Implemented

## User story

As a maintainer, I want concise project instructions, agents, skills, CI, and evidence rules so that AI-assisted changes remain bounded and reviewable.

## Acceptance criteria

- [x] Root `AGENTS.md` states architecture, scope, licensing, and verification rules.
- [x] Project Codex config bounds subagent concurrency and keeps Penpot optional.
- [x] Exactly four narrow custom agents cover architecture, implementation, review, and visual review.
- [x] Exactly five repository skills cover Angular delivery, Ollama integration, conversation context, UI design, and release evidence.
- [x] Agent instructions discourage unnecessary delegation and parallel write conflicts.
- [x] A CI workflow installs deterministically, builds, and runs ChromeHeadless tests.
- [x] Story status changes require implementation or verification evidence.

## Implementation evidence

- The workflow is intentionally small and repository-specific rather than an autonomous orchestration framework.

## Verification

Run focused tests for changed behavior, `npm run build`, and `npm test -- --watch=false --browsers=ChromeHeadless`. Report environment-only limitations explicitly.
