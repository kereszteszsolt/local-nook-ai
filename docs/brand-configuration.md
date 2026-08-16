# Brand configuration

The user-visible working name is **LocalNook**. The technical repository remains `ng-ollama`, and Ollama remains the model provider/runtime name.

## Source of truth

`src/app/core/config/brand.config.ts` defines:

```ts
interface BrandConfig {
  productName: string;
  tagline: string;
  repositoryName: string;
  developer: {
    name: string;
    website: string;
  };
}
```

The default config contains:

- product name: `LocalNook`;
- repository name: `ng-ollama`;
- developer: Keresztes Zsolt;
- website: `https://kereszteszsolt.hu`.

The runtime browser title and primary toolbar label consume this configuration. The static
HTML title is deliberately brand-neutral so it does not create a second product-name source of
truth before Angular bootstraps.

## Rename rule

A display rename should normally require changing the default `BrandConfig`, then updating documentation and any deliberate marketing copy. It must not rename:

- the `LAC-*` story IDs;
- localStorage keys;
- the planned IndexedDB database/store identifiers;
- the Ollama provider name or endpoint;
- Angular selectors solely for cosmetic consistency.

This prevents a rebrand from losing local user data or creating a wide mechanical diff.

## Separation from runtime configuration

`OllamaRuntimeConfig` owns the host, currently `http://localhost:11434`. Brand configuration contains no host, credentials, machine-specific value, or secret.
