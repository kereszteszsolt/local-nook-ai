# Codex project setup

This directory contains the small project-scoped Codex setup for **LocalNook** / `ng-ollama`.

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
