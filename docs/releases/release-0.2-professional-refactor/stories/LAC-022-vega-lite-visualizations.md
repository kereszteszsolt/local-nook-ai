# LAC-022: Render Vega-Lite data visualizations

## Status

Implemented

## User story

As a user, I want supported data visualizations in assistant responses rendered as interactive charts, so that I can explore structured results without leaving LocalNook.

## Acceptance criteria

- [x] Render a Vega-Lite chart when an assistant response contains a supported, fenced Vega-Lite JSON specification.
- [x] Keep ordinary Markdown, Prism-highlighted code, Mermaid diagrams, and KaTeX formulas working unchanged.
- [x] Validate and bound chart specifications before rendering; never execute JavaScript supplied in an assistant response.
- [x] Present a clear, accessible fallback when a chart specification is invalid or unsupported, while preserving the original response content.
- [x] Support responsive charts with accessible titles, descriptions, and a tabular data alternative when supplied by the specification.
- [x] Cover valid rendering, invalid-specification fallback, and preservation of existing rich-content rendering with focused tests.

## Verification

Run focused tests for changed behavior, `npm run build`, and `npm test -- --watch=false --browsers=ChromeHeadless`. Report environment-only limitations explicitly.

## Comments

- Only bounded inline `data.values` JSON using a narrow, allowlisted Vega-Lite v5 subset is accepted; remote data, transforms, expressions, and executable input are rejected.
- Vega rendering loads on demand; standard Markdown, Mermaid, KaTeX, and Prism rendering continues through `ngx-markdown`.
- The ChromeHeadless suite passed 67/67 tests. The production build still exceeds the existing 1 MB initial-bundle budget (4.68 MB); Vega is emitted as a lazy 868 kB chunk.
