// SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
// SPDX-License-Identifier: Apache-2.0

import { AfterViewInit, Component, ElementRef, inject, Input, OnChanges, OnDestroy, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { Result } from 'vega-embed';
import { ChartRow, parseVegaLiteSpec, VegaLiteSpecResult } from './vega-lite-spec';
import { VegaLiteRendererService } from './vega-lite-renderer.service';

@Component({
  selector: 'ollama-chat-vega-lite-chart',
  imports: [],
  templateUrl: './vega-lite-chart.component.html',
  styleUrl: './vega-lite-chart.component.scss',
})
export class VegaLiteChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartHost') chartHost?: ElementRef<HTMLDivElement>;
  @Input({ required: true }) source = '';

  private readonly platformId = inject(PLATFORM_ID);
  private readonly renderer = inject(VegaLiteRendererService);
  private result?: Result;
  private renderGeneration = 0;
  private initialized = false;

  validation: VegaLiteSpecResult = parseVegaLiteSpec('');
  renderError = '';

  ngOnChanges(): void {
    this.renderGeneration += 1;
    this.result?.finalize();
    this.result = undefined;
    this.renderError = '';
    this.validation = parseVegaLiteSpec(this.source);

    if (this.initialized) {
      void this.renderChart(this.renderGeneration);
    }
  }

  ngAfterViewInit(): void {
    this.initialized = true;
    void this.renderChart(this.renderGeneration);
  }

  ngOnDestroy(): void {
    this.result?.finalize();
  }

  get canRender(): boolean {
    return this.validation.valid && this.renderError === '';
  }

  get fallbackMessage(): string {
    return this.validation.valid
      ? this.renderError
      : this.validation.error;
  }

  get title(): string | undefined {
    return this.validation.valid ? this.validation.title : undefined;
  }

  get description(): string | undefined {
    return this.validation.valid ? this.validation.description : undefined;
  }

  get columns(): string[] {
    return this.validation.valid ? this.validation.columns : [];
  }

  get rows(): ChartRow[] {
    return this.validation.valid ? this.validation.rows : [];
  }

  displayValue(row: ChartRow, column: string): string {
    const value = row[column];
    return value === null || value === undefined ? '—' : String(value);
  }

  private async renderChart(generation: number): Promise<void> {
    if (!this.validation.valid || !this.chartHost || !isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      this.result = await this.renderer.render(this.chartHost.nativeElement, this.validation.spec);
      if (generation !== this.renderGeneration) {
        this.result.finalize();
        this.result = undefined;
      }
    } catch {
      if (generation === this.renderGeneration) {
        this.renderError = 'The chart could not be rendered. The original specification is shown below.';
      }
    }
  }
}
