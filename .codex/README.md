# Codex project setup

This directory contains the small project-scoped Codex setup for **LocalNook** / **LocalNook AI** in the `localnook-ai` repository.

- `config.toml` enables bounded subagent use and registers the optional local Penpot MCP endpoint.
- `agents/` contains four narrow custom agents.
- Root `AGENTS.md` defines the repository-wide working agreement.
- Reusable task workflows live under `.agents/skills/`.

## Agent flow

A full story may use:

```text
architect -> implementation_worker -> reviewer
                         \-> design_reviewer (only for visual work)
```

Do not invoke the whole set for small changes, and do not run multiple write-owning agents over the same files.

## Approval checkpoints

Before implementing a story, present its bounded scope, risks, planned changes, and verification, then ask the user for explicit approval to start. Before every commit, present the current story's implemented acceptance criteria, verification results and limitations, scoped diff, and proposed commit message, then ask for separate explicit commit approval. Story approval never implies commit approval or approval for the next story.

Suggested Hungarian prompts:

```text
Kezdhetjük a LAC-NNN – <story title> user storyt?
Engedélyezed a LAC-NNN változásainak commitolását ezzel az üzenettel: <commit message>?
```

## Local Penpot MCP

Start the local server:

```bash
npx -y @penpot/mcp@stable
```

Codex connects to:

```text
http://localhost:4401/mcp
```

In Penpot, load the plugin manifest from:

```text
http://localhost:4400/manifest.json
```

Open the relevant design and connect the plugin. Begin with read-only inspection; design writes should be small and reversible. Penpot is optional for non-visual implementation and verification work.
