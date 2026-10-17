# Codex roles and skills

Use the root `AGENTS.md` and **one active task/story**. The main session is the default writer; historical roles are optional tools, **not** a pipeline:

| Agent | Trigger |
| --- | --- |
| `implementation_worker` | One approved delegated feature/fix (sole writer) |
| `architect` | Read-only cross-boundary Angular/context/storage assessment |
| `reviewer` | Read-only security/regression/test review of a risky diff |
| `design_reviewer` | Read-only Penpot/token/accessibility review for an actual visual change |

Select only matching skills (`angular-feature-delivery`, `ollama-integration`, `conversation-context`, `ui-design`, `release-evidence`). Their purpose is the **technical method**, not story-specific product logic. Do not load all skills, double-review simple changes or run tests twice.

Before implementation and before commit, request separate approval. Never treat approval for one story as approval for a push or the next story.

## Optional Penpot MCP

`.codex/config.toml` preserves the optional local `http://localhost:4401/mcp` connection. Use it only for Penpot design tasks. In Penpot, connect the plugin via `http://localhost:4400/manifest.json` after starting `npx -y @penpot/mcp@stable`. Start with read-only inspection, approve reversible design writes and do not require MCP for unrelated work.
