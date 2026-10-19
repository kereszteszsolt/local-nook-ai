import { Component, inject, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ChatFacade } from '../../../features/chat/application/chat-facade.service';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { AiModelDto } from '../../../features/chat/models/ai-model.model';
import { APP_INFO_CONFIG } from '../../../core/config/app-info.config';
import { AboutComponent } from '../about/about.component';

@Component({
  selector: 'ollama-chat-nav',
  imports: [
    MatIcon,
    MatToolbar,
    MatMenu,
    MatMenuItem,
    MatButton,
    MatMenuTrigger,
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  readonly chatFacade = inject(ChatFacade);
  readonly appInfo = inject(APP_INFO_CONFIG);
  readonly currentModel = this.chatFacade.currentModel;
  readonly availableModels = this.chatFacade.aiModels;

  ngOnInit(): void {
    void this.chatFacade.loadModels();
  }

  onModelChange(model: AiModelDto): void {
    void this.chatFacade.setCurrentModel(model);
  }

  openAbout(): void {
    this.dialog.open(AboutComponent, {
      width: '780px',
      // Match the tooltip overlay's 8px viewport margin to avoid clipped bubbles.
      maxWidth: 'calc(100vw - 16px)',
      maxHeight: 'calc(100dvh - 24px)',
      backdropClass: ['cdk-overlay-dark-backdrop', 'about-backdrop'],
      autoFocus: '[aria-label="Close about"]',
    });
  }
}
