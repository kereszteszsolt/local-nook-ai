# LAC-030: README and release presentation

## Status

Planned

## User story

As a prospective user or contributor, I want the root README to present the verified LocalNook experience, setup choices, visual examples, and engineering evidence clearly so that I can evaluate and start the project confidently.

## Context

The current README predates implemented IndexedDB behavior and does not include the Release 0.3 startup, screenshot, user-guide, contact, or support presentation.

## Scope

Rebuild the root README presentation from implemented release evidence, actual dependency versions, approved screenshots, current startup modes, and maintained documentation links.

## Acceptance criteria

- [ ] Use accurate badges whose values match repository configuration or a directly verifiable project property.
- [ ] Present one representative privacy-safe screenshot and link to the complete screenshot gallery.
- [ ] Link to the user guide, documentation index, architecture, testing guide, and Releases 0.1 through 0.3.
- [ ] Provide concise quick starts for both an existing host Ollama and the optional containerized Ollama mode.
- [ ] Describe only implemented features, including actual browser-local persistence, deletion, rich rendering, and system-prompt behavior.
- [ ] Present the canonical LocalNook project, package, repository, Docker, story-prefix, developer, and license identity accurately.
- [ ] Include a short factual AI-assisted engineering section linking to the four agents and five repository skills.
- [ ] List reproducible install, build, test, screenshot, and Compose verification commands with honest environment limitations.
- [ ] Include the approved maintainer Contact table and Ways to support links.
- [ ] Verify Markdown links, image references, Mermaid blocks, badges, commands, version claims, license text, and rendered presentation.

## Verification

Cross-check README claims against code and completed stories, validate internal/external links and images, render the Markdown where possible, and run the documented verification commands or record exact limitations.

## Out of scope

Marketing claims without evidence, generated benchmark claims, hosted-service instructions, roadmap promises presented as features, and changes to Git remotes are excluded.

## Implementation evidence

None recorded in this planning commit. Evidence will be added during LAC-030 implementation.
