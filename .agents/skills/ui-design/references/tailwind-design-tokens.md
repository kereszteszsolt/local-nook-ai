# Tailwind theme token contract

Primary source: `https://tailwindcss.com/docs/theme`

LocalNook defines reusable product-level values in a top-level Tailwind `@theme` block. Current semantic namespaces include:

```css
@theme {
  --color-surface: ...;
  --color-surface-raised: ...;
  --color-surface-muted: ...;
  --color-text-primary: ...;
  --color-text-muted: ...;
  --color-border-subtle: ...;
  --color-accent: ...;
  --color-accent-soft: ...;
  --color-danger: ...;
  --color-danger-soft: ...;
  --radius-panel: ...;
}
```

These variables create utilities such as `bg-surface-raised`, `text-text-primary`, `border-border-subtle`, and `rounded-panel` while remaining available as CSS custom properties.

Add a token when a decision is reused or represents the product language. Do not create one token for every one-off measurement.
