---
name: angular-feature-delivery
description: Implement or refactor Angular code in LocalNook. Use for bounded features, fixes, tests, architecture cleanup, branding consumers, Docker/CI changes, or controlled dependency work; skip for release-document-only edits.
---

# Angular feature delivery

1. Read root `AGENTS.md` and the relevant `LAC-*` story.
2. Trace the current execution path before editing.
3. Keep the dependency direction small: component -> facade/application -> client or repository.
4. Prefer Angular dependency injection, signals, strict types, and existing framework capabilities.
5. Preserve unaffected Release 0.1 behavior and browser-local ownership.
6. Keep product labels in `BrandConfig`; keep runtime and persistence identities separate.
7. Add focused tests for changed outcomes, including failure paths where relevant.
8. Add SPDX headers only to new comment-supporting source/configuration files.
9. Run build/tests or report the exact environment limitation.
10. Update story status only when acceptance evidence exists.

For LAC-017, update compatible dependency groups deliberately, use official migration guidance, and regenerate the lock file through the package manager in a normal connected development environment.
