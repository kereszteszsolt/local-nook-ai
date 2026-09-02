// SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
// SPDX-License-Identifier: Apache-2.0

import type { TopLevelSpec } from 'vega-lite';

const MAX_SPEC_LENGTH = 100_000;
const MAX_DATA_ROWS = 250;
const MAX_DATA_FIELDS = 20;
const MAX_STRING_LENGTH = 1_000;
const SUPPORTED_MARKS = new Set(['area', 'bar', 'circle', 'line', 'point', 'rect', 'square', 'tick']);
const SUPPORTED_MARK_OPTIONS = new Set(['point', 'type']);
const SUPPORTED_CHANNELS = new Set(['color', 'shape', 'size', 'tooltip', 'x', 'y']);
const SUPPORTED_FIELD_TYPES = new Set(['nominal', 'ordinal', 'quantitative', 'temporal']);
const SUPPORTED_AGGREGATES = new Set(['average', 'count', 'max', 'median', 'min', 'sum']);
const SUPPORTED_SPEC_KEYS = new Set([
  '$schema',
  'data',
  'description',
  'encoding',
  'height',
  'mark',
  'title',
  'width',
]);

export type ChartValue = boolean | number | string | null;
export type ChartRow = Record<string, ChartValue>;

export type VegaLiteChartSpec = TopLevelSpec;

export type RichContentBlock =
  | { kind: 'markdown'; content: string }
  | { kind: 'vega-lite'; source: string };

export type VegaLiteSpecResult =
  | { valid: true; spec: VegaLiteChartSpec; title?: string; description?: string; columns: string[]; rows: ChartRow[] }
  | { valid: false; error: string };

export function splitRichContent(content: string): RichContentBlock[] {
  const blocks: RichContentBlock[] = [];
  const chartFence = /^```(?:vega-lite|vegalite|vl)[ \t]*\r?\n([\s\S]*?)^```[ \t]*\r?$/gim;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = chartFence.exec(content)) !== null) {
    if (match.index > cursor) {
      blocks.push({ kind: 'markdown', content: content.slice(cursor, match.index) });
    }

    blocks.push({ kind: 'vega-lite', source: match[1].trim() });
    cursor = match.index + match[0].length;
  }

  if (cursor < content.length || blocks.length === 0) {
    blocks.push({ kind: 'markdown', content: content.slice(cursor) });
  }

  return blocks;
}

export function parseVegaLiteSpec(source: string): VegaLiteSpecResult {
  if (source.length > MAX_SPEC_LENGTH) {
    return invalid('The chart specification is too large to render.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    return invalid('The chart specification is not valid JSON.');
  }

  if (!isRecord(parsed)) {
    return invalid('The chart specification must be a JSON object.');
  }

  if (Object.keys(parsed).some((key) => !SUPPORTED_SPEC_KEYS.has(key))) {
    return invalid('The chart specification uses an unsupported Vega-Lite feature.');
  }

  if (!isOptionalText(parsed['$schema']) || (parsed['$schema'] !== undefined && !parsed['$schema'].startsWith('https://vega.github.io/schema/vega-lite/v5'))) {
    return invalid('The chart must use a Vega-Lite v5 schema.');
  }

  if (!isOptionalText(parsed['title']) || !isOptionalText(parsed['description'])) {
    return invalid('Chart titles and descriptions must be short text values.');
  }

  if (!isBoundedDimension(parsed['width']) || !isBoundedDimension(parsed['height'])) {
    return invalid('Chart dimensions must be between 1 and 1200 pixels.');
  }

  if (!isSupportedMark(parsed['mark'])) {
    return invalid('The chart mark is not supported.');
  }

  const rows = parseInlineRows(parsed['data']);
  if (!rows) {
    return invalid('Charts must contain a bounded inline data.values array.');
  }

  if (!isSafeEncoding(parsed['encoding'])) {
    return invalid('The chart encoding is unsupported or unsafe.');
  }

  return {
    valid: true,
    spec: parsed as unknown as VegaLiteChartSpec,
    title: parsed['title'] as string | undefined,
    description: parsed['description'] as string | undefined,
    columns: [...new Set(rows.flatMap((row) => Object.keys(row)))],
    rows,
  };
}

function invalid(error: string): VegaLiteSpecResult {
  return { valid: false, error };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOptionalText(value: unknown): value is string | undefined {
  return value === undefined || (typeof value === 'string' && value.length <= MAX_STRING_LENGTH);
}

function isBoundedDimension(value: unknown): boolean {
  return value === undefined || (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 1200);
}

function isSupportedMark(value: unknown): boolean {
  if (typeof value === 'string') {
    return SUPPORTED_MARKS.has(value);
  }

  return isRecord(value)
    && Object.keys(value).every((key) => SUPPORTED_MARK_OPTIONS.has(key))
    && typeof value['type'] === 'string'
    && SUPPORTED_MARKS.has(value['type'])
    && (value['point'] === undefined || (value['type'] === 'line' && typeof value['point'] === 'boolean'));
}

function parseInlineRows(value: unknown): ChartRow[] | null {
  if (!isRecord(value) || Object.keys(value).length !== 1 || !Array.isArray(value['values'])) {
    return null;
  }

  const values = value['values'];
  if (values.length > MAX_DATA_ROWS || !values.every(isSafeRow)) {
    return null;
  }

  return values;
}

function isSafeRow(value: unknown): value is ChartRow {
  return isRecord(value)
    && Object.keys(value).length <= MAX_DATA_FIELDS
    && Object.entries(value).every(([key, cell]) => key.length <= MAX_STRING_LENGTH && isChartValue(cell));
}

function isChartValue(value: unknown): value is ChartValue {
  return value === null
    || typeof value === 'boolean'
    || (typeof value === 'number' && Number.isFinite(value))
    || (typeof value === 'string' && value.length <= MAX_STRING_LENGTH);
}

function isSafeEncoding(value: unknown): boolean {
  if (!isRecord(value) || Object.keys(value).length === 0 || Object.keys(value).some((key) => !SUPPORTED_CHANNELS.has(key))) {
    return false;
  }

  return Object.values(value).every((channel) => {
    if (!isRecord(channel) || Object.keys(channel).some((key) => !['aggregate', 'field', 'title', 'type'].includes(key))) {
      return false;
    }

    return typeof channel['field'] === 'string'
      && channel['field'].length <= MAX_STRING_LENGTH
      && typeof channel['type'] === 'string'
      && SUPPORTED_FIELD_TYPES.has(channel['type'])
      && isOptionalText(channel['title'])
      && (channel['aggregate'] === undefined || (typeof channel['aggregate'] === 'string' && SUPPORTED_AGGREGATES.has(channel['aggregate'])));
  });
}
