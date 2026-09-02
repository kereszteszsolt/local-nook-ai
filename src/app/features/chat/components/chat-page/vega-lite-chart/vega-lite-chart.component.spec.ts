// SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
// SPDX-License-Identifier: Apache-2.0

import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Result } from 'vega-embed';
import { VegaLiteChartComponent } from './vega-lite-chart.component';
import { VegaLiteRendererService } from './vega-lite-renderer.service';

const validChart = JSON.stringify({
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Requests',
  description: 'Requests by month.',
  data: { values: [{ month: 'January', requests: 32 }] },
  mark: 'bar',
  encoding: {
    x: { field: 'month', type: 'ordinal' },
    y: { field: 'requests', type: 'quantitative' },
  },
});

describe('VegaLiteChartComponent', () => {
  let fixture: ComponentFixture<VegaLiteChartComponent>;
  let renderer: jasmine.SpyObj<VegaLiteRendererService>;

  beforeEach(async () => {
    renderer = jasmine.createSpyObj<VegaLiteRendererService>('VegaLiteRendererService', ['render']);
    renderer.render.and.resolveTo({ finalize: jasmine.createSpy('finalize') } as unknown as Result);

    await TestBed.configureTestingModule({
      imports: [VegaLiteChartComponent],
      providers: [{ provide: VegaLiteRendererService, useValue: renderer }],
    }).compileComponents();

    fixture = TestBed.createComponent(VegaLiteChartComponent);
  });

  it('renders a validated chart with its accessible title and data table', async () => {
    fixture.componentRef.setInput('source', validChart);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(renderer.render).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('figure')?.getAttribute('aria-label')).toBe('Requests');
    expect(fixture.nativeElement.textContent).toContain('View chart data as a table');
    expect(fixture.nativeElement.textContent).toContain('January');
  });

  it('keeps an invalid specification visible as a safe fallback', () => {
    fixture.componentRef.setInput('source', '{not JSON}');
    fixture.detectChanges();

    expect(renderer.render).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.vega-lite-fallback')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('not valid JSON');
    expect(fixture.nativeElement.querySelector('code')?.textContent).toBe('{not JSON}');
  });
});
