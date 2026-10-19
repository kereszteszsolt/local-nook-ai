# LocalNook AI branding

[`branding.json`](branding.json) follows the shared display-branding structure used by StonePlan AI. Edit project metadata here. It contains no credentials or runtime provider configuration.

| Field | Meaning |
| --- | --- |
| `appName` | Full app name: `LocalNook AI` |
| `appTagline` | Short product tagline |
| `appDescription` | About description |
| `appWebsite` | Project website; empty when none is configured |
| `appGithubUrl` | Project repository |
| `appFavicon` | Optional local favicon |
| `appIcon` | Optional local project mark |
| `appPoster` | Optional local project poster |
| `authorName` | Author display name |
| `authorWebsite` | Author website |
| `authorWebsiteLanguages` | Language codes listed in website/support tooltips |
| `authorGithub` | Author GitHub profile |
| `authorWaysToSupportUrl` | General ways to support the author |
| `authorBuyMeACoffeeUrl` | Direct Buy Me a Coffee link |
| `supportRemarkText` | Voluntary-support note; sentences start on separate lines in About |

Asset paths are relative to this `brand/` directory and must stay inside `assets/`. Empty paths mean no image. These are source paths, not public URLs: consumers must package or map them to their own public base. Do not fetch remote artwork or resolve arbitrary filesystem paths.

The SVG and PNG posters are unchanged copies of `kereszteszsolt/project-cards/localnook-ai-poster.*` from the profile repository. `appPoster` selects the vector version; the PNG is the social-preview alternative. The SVG mark was moved from `public/favicon.svg`. Preserve original artwork when adding variants. `public/favicon.ico` is a generated 16/32/48/64 px fallback using the same SVG selected by `appFavicon`. After changing that SVG, regenerate it with `node scripts/generate-favicon.mjs` (requires the project dependencies and Playwright Chromium). The page declares the configured SVG as its only icon link; the root ICO also contains LocalNook AI artwork for browser fallback requests.

The JSON is the shared input for the injectable application branding adapter. It drives the document title/favicon, header name/icon, About poster/description/destination buttons and sidebar attribution. Empty optional artwork or link values omit those items. The About dialog uses Angular Material keyboard/focus behavior and styled Material speech-bubble tooltips. See [the integration guide](../docs/app-configuration.md).

`appName` is the only product-name field. Application labels consume it through `AppInfoConfig.productName`; documentation uses the same exact spelling. `supportRemarkText` supplies the About support note, with each sentence on its own desktop line and natural wrapping on mobile. Technical project identities stay outside this display-branding JSON.

License identifiers and URLs are not part of the branding contract. The legal source of truth remains the root `LICENSE` and existing SPDX notices; branding edits must not rewrite those or rename stable storage/package identifiers.
