import { Component, inject, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { ChatFacade } from '../../../features/chat/application/chat-facade.service';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { AiModelDto } from '../../../features/chat/models/ai-model.model';
import { BRAND_CONFIG } from '../../../core/config/brand.config';

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
  readonly chatFacade = inject(ChatFacade);
  readonly brand = inject(BRAND_CONFIG);
  readonly currentModel = this.chatFacade.currentModel;
  readonly availableModels = this.chatFacade.aiModels;

  ngOnInit(): void {
    void this.chatFacade.loadModels();
  }

  onModelChange(model: AiModelDto): void {
    void this.chatFacade.setCurrentModel(model);
  }
}
