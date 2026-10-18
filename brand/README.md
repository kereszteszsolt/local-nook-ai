# LocalNook branding

[`branding.json`](branding.json) follows the TypeNudge display-branding contract. Edit project metadata here. It contains no credentials or runtime provider configuration.

| Field | Meaning |
| --- | --- |
| `appName` | Display name |
| `appWebsite` | Project website; empty when none is configured |
| `appGithubUrl` | Project repository |
| `authorName` | Author display name |
| `authorWebsite` | Author website |
| `authorGithub` | Author GitHub profile |
| `authorWaysToSupportUrl` | General ways to support the author |
| `authorBuyMeACoffeeUrl` | Direct Buy Me a Coffee link |
| `license` | Display-only license identifier |
| `licenseUrl` | Destination for the inline license link |
| `appDescription` | About description |
| `authorWebsiteLanguages` | Language codes listed in website/support tooltips |
| `appFavicon` | Optional local favicon |
| `appIcon` | Optional local project mark |
| `appPoster` | Optional local project poster |

Asset paths are relative to this `brand/` directory and must stay inside `assets/`. Empty paths mean no image. These are source paths, not public URLs: consumers must package or map them to their own public base. Do not fetch remote artwork or resolve arbitrary filesystem paths.

The SVG and PNG posters are unchanged copies of `kereszteszsolt/project-cards/localnook-ai-poster.*` from the profile repository. `appPoster` selects the vector version; the PNG is the social-preview alternative. The SVG mark was moved from `public/favicon.svg`. Preserve original artwork when adding variants.

The JSON is the shared input for the injectable application branding adapter. It drives the document title/favicon, header name/icon, About poster/description/destination buttons and sidebar attribution. Empty optional artwork or link values omit those items. The About dialog uses Angular Material keyboard/focus behavior and styled Material speech-bubble tooltips. See [the integration guide](../docs/brand-configuration.md).

`appExtendedName` and `appTagline` preserve distinct existing text that cannot fit `appName`. `technical.repository` retains the established `localnook-ai` technical identity independently of the current repository URL; storage keys remain unchanged.

The license field is display metadata only. The legal source of truth remains the root `LICENSE` and existing SPDX notices; branding edits must not rewrite those or rename stable storage/package identifiers.
