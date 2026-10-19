import { Component, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NavComponent } from './shared/components/nav/nav.component';
import { APP_INFO_CONFIG } from './core/config/app-info.config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly appInfo = inject(APP_INFO_CONFIG);
  private readonly title = inject(Title);
  private readonly document = inject(DOCUMENT);

  constructor() {
    this.title.setTitle(this.appInfo.productName);
    const favicon = this.document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (this.appInfo.favicon) {
      favicon?.setAttribute('href', this.appInfo.favicon);
    } else {
      favicon?.removeAttribute('href');
    }
  }
}
