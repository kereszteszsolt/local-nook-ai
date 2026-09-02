---
name: release-evidence
description: Maintain LocalNook release plans and LAC user stories. Use when adding or reconciling story status, acceptance criteria, architecture links, implementation notes, or verification evidence; skip for ordinary code-only changes.
---

# Release evidence

Use the repository story structure:

1. Status
2. User story
3. Acceptance criteria
4. Implementation evidence or notes when useful
5. Verification

Rules:

- Story IDs use the stable `LAC-` prefix, independent of the display brand.
- `Implemented` requires code or configuration evidence for the stated behavior.
- `In progress` means only part of the acceptance contract is present.
- `Planned` is a target, not a claim.
- Keep criteria observable and bounded; do not mirror low-level task lists.
- Keep cross-cutting decisions in the topic docs rather than repeating them in every story.
- Record missing build/test evidence explicitly instead of checking criteria optimistically.
