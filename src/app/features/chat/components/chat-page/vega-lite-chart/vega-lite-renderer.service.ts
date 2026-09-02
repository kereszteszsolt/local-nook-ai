// SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
// SPDX-License-Identifier: Apache-2.0

import { Injectable } from '@angular/core';
import type { Result } from 'vega-embed';
import { VegaLiteChartSpec } from './vega-lite-spec';

@Injectable({ providedIn: 'root' })
export class VegaLiteRendererService {
  async render(container: HTMLElement, spec: VegaLiteChartSpec): Promise<Result> {
    const { default: embed } = await import('vega-embed');

    return embed(container, spec, {
      actions: false,
      renderer: 'svg',
    });
  }
}
