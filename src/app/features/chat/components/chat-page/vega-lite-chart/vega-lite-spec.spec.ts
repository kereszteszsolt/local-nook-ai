// SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
// SPDX-License-Identifier: Apache-2.0

import { parseVegaLiteSpec, splitRichContent } from './vega-lite-spec';

const validChart = JSON.stringify({
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Monthly requests',
  description: 'Requests received in the first quarter.',
  data: { values: [{ month: 'January', requests: 32 }, { month: 'February', requests: 48 }] },
  mark: 'bar',
  encoding: {
    x: { field: 'month', type: 'ordinal' },
    y: { field: 'requests', type: 'quantitative' },
    tooltip: { field: 'requests', type: 'quantitative' },
  },
});

describe('Vega-Lite rich content', () => {
  it('separates Vega-Lite fences while preserving other Markdown blocks', () => {
    const content = `# Report\n\n\`\`\`mermaid\nflowchart LR\nA --> B\n\`\`\`\n\n\`\`\`vega-lite\n${validChart}\n\`\`\`\n\nConclusion.`;

    expect(splitRichContent(content)).toEqual([
      { kind: 'markdown', content: '# Report\n\n```mermaid\nflowchart LR\nA --> B\n```\n\n' },
      { kind: 'vega-lite', source: validChart },
      { kind: 'markdown', content: '\n\nConclusion.' },
    ]);
  });

  it('accepts bounded inline Vega-Lite data and exposes it as a table', () => {
    const result = parseVegaLiteSpec(validChart);

    expect(result.valid).toBeTrue();
    if (!result.valid) {
      fail(result.error);
      return;
    }

    expect(result.title).toBe('Monthly requests');
    expect(result.columns).toEqual(['month', 'requests']);
    expect(result.rows).toEqual([{ month: 'January', requests: 32 }, { month: 'February', requests: 48 }]);
  });

  it('accepts a line mark object with safe point overlays', () => {
    const chart = JSON.stringify({
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: [{ x: -1, y: 4 }, { x: 0, y: 1 }, { x: 1, y: 0 }] },
      mark: { type: 'line', point: true },
      encoding: {
        x: { field: 'x', type: 'quantitative' },
        y: { field: 'y', type: 'quantitative' },
      },
    });

    expect(parseVegaLiteSpec(chart).valid).toBeTrue();
  });

  it('rejects mark options outside the bounded allowlist', () => {
    const chart = JSON.stringify({
      data: { values: [{ x: 1, y: 2 }] },
      mark: { type: 'line', point: true, href: 'https://example.test' },
      encoding: {
        x: { field: 'x', type: 'quantitative' },
        y: { field: 'y', type: 'quantitative' },
      },
    });

    expect(parseVegaLiteSpec(chart).valid).toBeFalse();
  });

  it('rejects network data and executable Vega-Lite features', () => {
    const remoteData = JSON.stringify({
      data: { url: 'https://example.test/data.json' },
      mark: 'line',
      encoding: { x: { field: 'x', type: 'quantitative' } },
    });
    const expression = JSON.stringify({
      data: { values: [{ x: 1, y: 2 }] },
      mark: 'line',
      encoding: { x: { field: 'x', type: 'quantitative' }, y: { field: 'y', type: 'quantitative' } },
      transform: [{ calculate: 'window.alert(1)', as: 'unsafe' }],
    });

    expect(parseVegaLiteSpec(remoteData).valid).toBeFalse();
    expect(parseVegaLiteSpec(expression).valid).toBeFalse();
  });
});
