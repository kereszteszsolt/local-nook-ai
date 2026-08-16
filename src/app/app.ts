import { Component, inject } from '@angular/core';
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

  constructor() {
    this.title.setTitle(this.brand.productName);
  }
}
