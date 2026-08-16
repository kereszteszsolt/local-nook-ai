/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

export interface ConversationDeleteConfirmationData {
  readonly heading: string;
  readonly message: string;
  readonly confirmLabel: string;
}

@Component({
  selector: 'ollama-chat-conversation-delete-confirmation',
  imports: [MatButton, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle],
  templateUrl: './conversation-delete-confirmation.component.html',
})
export class ConversationDeleteConfirmationComponent {
  readonly data = inject<ConversationDeleteConfirmationData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConversationDeleteConfirmationComponent, boolean>);

  confirm(): void {
    this.dialogRef.close(true);
  }
}
