# LAC-016: Centralize product branding

## Status

Implemented

## User story

As a maintainer, I want product branding centralized so that LocalNook can be renamed without searching through components or breaking browser-local data.

## Acceptance criteria

- [x] A typed `BrandConfig` defines product, repository, and developer metadata.
- [x] The working display name is `LocalNook`.
- [x] The browser title and primary toolbar label consume BrandConfig.
- [x] The pre-bootstrap HTML title is brand-neutral rather than a second product-name constant.
- [x] Developer metadata includes Keresztes Zsolt and `https://kereszteszsolt.hu`.
- [x] Ollama runtime configuration is separate from BrandConfig.
- [x] Current and planned storage identities are documented as brand-independent.
- [x] Focused tests cover title and toolbar brand consumers.

## Implementation evidence

- Change `DEFAULT_BRAND_CONFIG` for a future display rename; do not rename story IDs or storage keys.

## Verification

Run focused tests for changed behavior, `npm run build`, and `npm test -- --watch=false --browsers=ChromeHeadless`. Report environment-only limitations explicitly.
