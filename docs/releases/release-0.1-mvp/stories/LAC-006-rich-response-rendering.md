# LAC-006: Render rich assistant content

## Status

Implemented

## User story

As a user, I want common structured response formats rendered clearly so that code, formulas, and diagrams are readable in the chat.

## Acceptance criteria

- [x] Markdown is rendered for assistant content.
- [x] Code blocks use syntax highlighting and load supported Prism languages.
- [x] Mermaid diagrams render from fenced content.
- [x] KaTeX formulas render from supported markup.
- [x] User and assistant messages remain visually distinct.

## Implementation evidence

- `ChatMessageComponent` uses `ngx-markdown` with Prism, Mermaid, and KaTeX assets configured by Angular.

## Verification

Preserve this behavior through focused unit tests and the repository build/test commands. Use a local Ollama smoke test for the real browser-to-runtime path.
