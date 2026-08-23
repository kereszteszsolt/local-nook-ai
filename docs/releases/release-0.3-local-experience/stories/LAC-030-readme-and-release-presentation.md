# LAC-030: README and release presentation

## Status

Implemented

## User story

As a prospective user or contributor, I want the root README to present the verified LocalNook experience, setup choices, visual examples, and engineering evidence clearly so that I can evaluate and start the project confidently.

## Context

The current README predates implemented IndexedDB behavior and does not include the Release 0.3 startup, screenshot, user-guide, contact, or support presentation.

## Scope

Rebuild the root README presentation from implemented release evidence, actual dependency versions, approved screenshots, current startup modes, and maintained documentation links.

## Acceptance criteria

- [x] Use accurate badges whose values match repository configuration or a directly verifiable project property.
- [x] Present one representative privacy-safe screenshot and link to the complete screenshot gallery.
- [x] Link to the user guide, documentation index, architecture, testing guide, and Releases 0.1 through 0.3.
- [x] Provide concise quick starts for both an existing host Ollama and the optional containerized Ollama mode.
- [x] Describe only implemented features, including actual browser-local persistence, deletion, rich rendering, and system-prompt behavior.
- [x] Present the canonical LocalNook project, package, repository, Docker, story-prefix, developer, and license identity accurately.
- [x] Include a short factual AI-assisted engineering section linking to the four agents and five repository skills.
- [x] List reproducible install, build, test, screenshot, and Compose verification commands with honest environment limitations.
- [x] Include the approved maintainer Contact table and Ways to support links.
- [x] Verify Markdown links, image references, Mermaid blocks, badges, commands, version claims, license text, and rendered presentation.

## Verification

- Cross-checked every feature, privacy, startup, architecture, identity, version, agent, skill, contact, support, and license claim against the current repository and completed LAC-024 through LAC-029 evidence. The README distinguishes the Release 0.3 repository milestone and Compose image tag from the private npm package's unchanged `0.1.0` version and makes no Git-tag or published-package claim.
- All README-relative files and both referenced heading anchors resolved. The representative `desktop-chat.png` retains its approved 1440 x 900 privacy-safe fixture, and the gallery link covers all five stable views.
- All five static Shields badge URLs returned HTTP 200. Their Release 0.3, Angular 20.3.28, Node.js 22.23.2, resolved `ollama/browser` 0.6.3, and Apache-2.0 values match release documentation, `package.json`, `package-lock.json`, `Dockerfile`, and `LICENSE` respectively; no unsupported CI, coverage, download, npm-published, or benchmark badge was added.
- The maintainer website, GitHub profile, and Buy Me a Coffee links returned HTTP 200. The task document's unlocalized `https://kereszteszsolt.hu/ways-to-support` target returned HTTP 404, so the README uses the site's current English `https://kereszteszsolt.hu/en/ways-to-support/` page, which was discovered through the live website and verified successfully.
- Parsed and rendered the complete README with the checked `marked`, Mermaid, and Playwright dependencies at 1280 px and 390 px widths. The single Mermaid block rendered in both views, all images loaded, wide command blocks remained scrollable, and visual inspection found no clipped section, broken table, unreadable diagram, or unsafe screenshot content.
- Both `docker compose config --quiet` and the two-file overlay equivalent passed. Quick-start commands and browser-reachable origins match the user guide and LAC-025/LAC-026 evidence. No new live Ollama, container-model download, streaming, or production Compose smoke was run for this documentation-only story.
- `npm ci` passed in `mcr.microsoft.com/playwright:v1.62.1-noble`; npm reported existing deprecation notices, five pending install-script approvals, and 22 audit findings (5 moderate and 17 high). Dependency remediation is outside LAC-030 and no package or lock-file change was made.
- The production build passed at 4.71 MB, 205.10 kB above the 4.5 MB warning threshold and below the 5 MB error threshold.
- The complete ChromeHeadless suite reached 93/94. The sole failure remains `SystemPromptRepository migrates valid current localStorage prompts once, preserving active state and order`; LAC-030 changes documentation only. The host WSL environment has no usable Linux Node binary, and the pinned container required its explicit Chromium path, non-root `pwuser`, an anonymous `dist` volume, and `SYS_ADMIN` capability because the host disables usable Chromium user namespaces.
- The deterministic screenshot workflow passed 5/5 in the pinned Playwright image and reproduced byte-identical hashes for every approved PNG. The image already contained matching Chromium, so the separate native `npx playwright install chromium` command was not needed in this container run.

## Out of scope

Marketing claims without evidence, generated benchmark claims, hosted-service instructions, roadmap promises presented as features, and changes to Git remotes are excluded.

## Implementation evidence

- The rebuilt root README now presents verified badges, one representative screenshot, implemented features and privacy limits, both Ollama quick starts, current architecture, reproducible verification, documentation/releases, canonical identity, bounded AI-assisted engineering, contact, support, and Apache-2.0 licensing.
- Obsolete in-memory/localStorage-only architecture and planned-IndexedDB claims were removed. Conversation and prompt IndexedDB, active-model localStorage, permanent deletion differences, configured Ollama processing, and intentional request context are described as implemented boundaries.
- The documentation index and Release 0.3 overview now record all seven stories as implemented. This closes Release 0.3 as a repository milestone without creating or claiming a tag, hosted release, npm publication, remote change, or dependency upgrade.
