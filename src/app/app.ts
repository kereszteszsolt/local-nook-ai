import { Component, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NavComponent } from './shared/components/nav/nav.component';
import { BRAND_CONFIG } from './core/config/brand.config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly brand = inject(BRAND_CONFIG);
  private readonly title = inject(Title);
  private readonly document = inject(DOCUMENT);

  constructor() {
    this.title.setTitle(this.brand.productName);
    const favicon = this.document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (this.brand.favicon) {
      favicon?.setAttribute('href', this.brand.favicon);
    } else {
      favicon?.removeAttribute('href');
    }
  }
}
