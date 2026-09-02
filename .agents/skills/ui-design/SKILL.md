---
name: ui-design
description: Design, implement, or review LocalNook UI with semantic Tailwind tokens and optional Penpot MCP. Use for layout, styling, interaction states, accessibility, responsive behavior, or design-to-code work.
---

# UI design workflow

1. Read `docs/design-system.md` and `docs/brand-configuration.md`.
2. When a relevant Penpot design is connected, inspect the focused page before editing.
3. Begin MCP work with read-only inspection; describe intended design writes and keep them reversible.
4. Use `BrandConfig` for product/developer labels.
5. Use top-level Tailwind `@theme` variables for reusable color and radius decisions.
6. Prefer semantic utilities such as `bg-surface-raised`, `text-text-muted`, and `border-border-subtle` over raw palette values in product UI.
7. Reuse Angular Material where it supplies correct semantics and keyboard behavior.
8. Implement default, hover/focus-visible, disabled, loading, empty, and error states where relevant.
9. Check responsive layout and keyboard navigation.
10. Keep visual changes within the story scope.

Penpot is a design aid, not a runtime dependency and not a blocker for non-visual work.
