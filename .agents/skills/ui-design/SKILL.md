---
name: ui-design
description: Use for LocalNook Angular Material/Tailwind components, semantic design tokens, responsive UI, accessibility and optional Penpot design inspection.
---

# Angular UI and design tokens

1. Inspect only the touched component and `docs/design-system.md`; use `docs/app-configuration.md` when changing labels.
2. Use semantic Tailwind `@theme` utilities and Angular Material behavior; avoid hardcoded duplicate palettes, focus traps and ad hoc interactive markup.
3. Cover keyboard/focus-visible, screen-reader labels, disabled/loading/empty/error states, and narrow-width layout.
4. Penpot MCP is optional: inspect the relevant frame only, and request approval before reversible design writes.
5. Run build/component checks and targeted Playwright screenshots only when visual behavior changed. Do not require UI redesign for backend/stream fixes.
