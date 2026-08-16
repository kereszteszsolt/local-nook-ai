# Design system

## Tailwind theme variables

Reusable product-level design values live in the top-level `@theme` block in `src/styles.scss`.

Current semantic tokens cover:

- surfaces: `surface`, `surface-raised`, `surface-muted`;
- text: `text-primary`, `text-muted`;
- borders: `border-subtle`;
- accent and accent-soft states;
- danger and danger-soft states;
- shared panel radius.

Tailwind generates semantic utilities such as:

```text
bg-surface-raised
text-text-primary
border-border-subtle
rounded-panel
```

Use a semantic token when a visual decision is reused or belongs to the product language. One-off layout measurements may remain local when creating a token would not improve consistency.

## Angular Material

Angular Material remains the semantic component base for toolbar, menus, dialog, buttons, icons, expansion panels, tooltips, and form controls. Tailwind handles layout and product-level styling; it should not replace accessible component behavior.

## Penpot workflow

Penpot MCP is optional and intended for relevant design work:

1. start `npx -y @penpot/mcp@stable`;
2. connect Codex to `http://localhost:4401/mcp`;
3. load `http://localhost:4400/manifest.json` in Penpot;
4. focus the relevant page and begin with inspection;
5. make small reversible design changes only after the intended change is clear.

Code work must continue when Penpot is unavailable unless the task specifically requires design inspection.

## Review checklist

Check keyboard access, focus visibility, disabled/loading/error states, readable contrast, responsive width, clear model selection, and the separation between `BrandConfig` labels and visual tokens.
