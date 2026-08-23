# Brand configuration

The display brand is **LocalNook**, and the extended product name is **LocalNook AI**. The repository identity is `localnook-ai`; Ollama remains the separate model provider/runtime name.

The related technical identities are deliberate and do not need to match character-for-character:

- npm package: `@localnook/app`;
- Angular application ID: `localnook-ai`;
- Docker Compose project: `localnook`;
- stable story prefix: `LAC-`.

The repository identity does not rewrite an existing Git remote. Maintainers may update a hosting slug separately when they explicitly intend to change that external repository setting.

## Source of truth

`src/app/core/config/brand.config.ts` defines:

```ts
interface BrandConfig {
  productName: string;
  extendedProductName: string;
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
- extended product name: `LocalNook AI`;
- repository name: `localnook-ai`;
- developer: Keresztes Zsolt;
- website: `https://kereszteszsolt.hu`.

The runtime browser title and primary toolbar label consume this configuration. The static
HTML title is deliberately brand-neutral so it does not create a second product-name source of
truth before Angular bootstraps.

## Rename rule

A display rename should normally require changing the default `BrandConfig`, then updating documentation and any deliberate marketing copy. The package, Angular application, Compose project, and repository identities are separate technical decisions. A display rename must not rename:

- the `LAC-*` story IDs;
- localStorage keys;
- IndexedDB database or store identifiers, including `local-ai-client.conversations` and `local-ai-client.system-prompts`;
- stable record identifiers, including `localnook.rich-response-formats.v1`;
- the Ollama provider name or endpoint;
- Angular selectors solely for cosmetic consistency.

This prevents a rebrand from losing local user data or creating a wide mechanical diff.

## Separation from runtime configuration

`OllamaRuntimeConfig` owns the host, currently `http://localhost:11434`. Brand configuration contains no host, credentials, machine-specific value, or secret.
