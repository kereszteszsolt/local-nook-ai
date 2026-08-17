import {Component, inject, OnInit, ViewChild, ElementRef} from '@angular/core';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SystemMessage} from '../../models/message.model';
import {ChatFacade} from '../../application/chat-facade.service';
import {BUILT_IN_SYSTEM_PROMPT_ID} from '../../infrastructure/system-prompt.repository';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';

@Component({
  selector: 'ollama-chat-system-prompt-settings',
  standalone: true,
  imports: [
    MatIconButton,
    MatTooltip,
    MatIcon,
    FormsModule,
    MatInput,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatButton,
    MatDialogContent,
    MatDialogTitle,
    MatDialogActions,
    MatAccordion,
  ],
  templateUrl: './system-prompt-settings.component.html',
  styleUrl: './system-prompt-settings.component.scss',
})
export class SystemPromptSettingsComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<SystemPromptSettingsComponent>);
  readonly chatFacade = inject(ChatFacade);
  readonly snackBar = inject(MatSnackBar);
  systemPrompts: (SystemMessage & { editing?: boolean })[] = [];
  builtInPrompt: SystemMessage | null = null;
  folders: string[] = [];
  editedFolderName: string = '';
  folderEditing: Record<string, boolean> = {};
  loading = false;
  storageError: string | null = null;
  showBuiltInInstructions = false;
  private editingPromptId: string | null = null;

  @ViewChild('folderNameInput') folderNameInput?: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    void this.loadPrompts();
  }

  async loadPrompts(): Promise<void> {
    this.loading = true;
    this.storageError = null;
    await this.chatFacade.loadSystemPrompts();
    this.loading = false;
    if (this.chatFacade.systemPromptStorageError()) {
      this.storageError = this.chatFacade.systemPromptStorageError();
      return;
    }
    this.syncFromFacade();
  }

  private syncFromFacade(): void {
    const prompts = this.chatFacade.systemPromptsSignal();
    this.builtInPrompt = prompts.find(prompt => prompt.sys_msg_id === BUILT_IN_SYSTEM_PROMPT_ID) ?? null;
    this.systemPrompts = prompts
      .filter(prompt => prompt.sys_msg_id !== BUILT_IN_SYSTEM_PROMPT_ID)
      .map(prompt => ({...prompt, editing: prompt.sys_msg_id === this.editingPromptId}));
    this.updateFolders();
  }

  private persistPrompts(): void {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.storageError = null;
    const prompts = this.builtInPrompt ? [this.builtInPrompt, ...this.systemPrompts] : this.systemPrompts;
    void this.chatFacade.saveSystemPrompts(prompts)
      .then(() => this.syncFromFacade())
      .catch(() => {
        this.storageError = this.chatFacade.systemPromptStorageError() ?? 'Could not save browser-local system prompts.';
        this.syncFromFacade();
        this.snackBar.open(this.storageError, 'Close', {duration: 5000});
      })
      .finally(() => {
        this.loading = false;
      });
  }

  updateFolders(): void {
    const uniqueFolders = [...new Set(this.systemPrompts.map(p => p.folder))];
    this.folders = uniqueFolders;
  }

  startEditFolderName(folder: string): void {
    this.editedFolderName = folder;
    this.folderEditing = {...this.folderEditing, [folder]: true};
    setTimeout(() => {
      this.folderNameInput?.nativeElement?.focus();
    });
  }

  saveFolderName(oldFolder: string): void {
    const newName = this.editedFolderName.trim();
    if (!newName || newName === oldFolder) {
      this.folderEditing = {...this.folderEditing, [oldFolder]: false};
      return;
    }
    this.systemPrompts = this.systemPrompts.map(p =>
      p.folder === oldFolder ? {...p, folder: newName} : p
    );
    this.updateFolders();
    this.persistPrompts();
    this.folderEditing = {...this.folderEditing, [oldFolder]: false};
  }

  addNewPromptFolder(): void {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.-]/g, '');
    const newFolderName = `New Folder ${timestamp}`;
    const newPrompt: SystemMessage & { editing?: boolean } = {
      sys_msg_id: crypto.randomUUID(),
      role: 'system',
      content: '',
      active: true,
      folder: newFolderName,
      editing: true,
    };
    this.systemPrompts = [...this.systemPrompts, newPrompt];
    this.editingPromptId = newPrompt.sys_msg_id;
    this.updateFolders();
    this.persistPrompts();
  }

  addNewPrompt(folder: string): void {
    const newPrompt: SystemMessage & { editing?: boolean } = {
      sys_msg_id: crypto.randomUUID(),
      role: 'system',
      content: '',
      active: true,
      folder,
      editing: true,
    };
    this.systemPrompts = [...this.systemPrompts, newPrompt];
    this.editingPromptId = newPrompt.sys_msg_id;
    this.persistPrompts();
  }

  editPrompt(index: number): void {
    this.editingPromptId = this.systemPrompts[index]?.sys_msg_id ?? null;
    this.systemPrompts = this.systemPrompts.map((p, i) =>
      i === index ? {...p, editing: true} : p
    );
  }

  savePrompt(index: number): void {
    if (this.systemPrompts[index]?.sys_msg_id === this.editingPromptId) {
      this.editingPromptId = null;
    }
    this.systemPrompts = this.systemPrompts.map((p, i) =>
      i === index ? {...p, editing: false} : p
    );
    this.persistPrompts();
  }

  removePrompt(index: number): void {
    this.systemPrompts = this.systemPrompts.filter((_, i) => i !== index);
    this.updateFolders();
    this.persistPrompts();
  }

  toggleActive(index: number): void {
    this.systemPrompts = this.systemPrompts.map((p, i) =>
      i === index ? {...p, active: !p.active} : p
    );
    this.persistPrompts();
  }

  toggleAllActive(folder: string, active: boolean): void {
    this.systemPrompts = this.systemPrompts.map(p =>
      p.folder === folder ? {...p, active} : p
    );
    this.persistPrompts();
  }

  clearFolder(folder: string): void {
    this.systemPrompts = this.systemPrompts.filter(p => p.folder !== folder);
    this.updateFolders();
    this.persistPrompts();
  }

  toggleBuiltInActive(): void {
    if (!this.builtInPrompt || this.loading) {
      return;
    }
    this.builtInPrompt = {...this.builtInPrompt, active: !this.builtInPrompt.active};
    this.persistPrompts();
  }

  restoreBuiltInInstructions(): void {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.storageError = null;
    void this.chatFacade.restoreBuiltInSystemPrompt()
      .then(() => this.syncFromFacade())
      .catch(() => {
        this.storageError = this.chatFacade.systemPromptStorageError() ?? 'Could not restore the LocalNook default prompt.';
        this.syncFromFacade();
        this.snackBar.open(this.storageError, 'Close', {duration: 5000});
      })
      .finally(() => {
        this.loading = false;
      });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  importFromCSV(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (!fileInput.files?.length) return;
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result as string;
      this.parseCSV(content);
    };
    reader.readAsText(file);
  }

  parseCSV(csvContent: string): void {
    const rows = this.parseCsvRows(csvContent);
    const [headerRow, ...dataRows] = rows;
    if (!headerRow) {
      this.snackBar.open('CSV is empty.', 'Close', {duration: 3000});
      return;
    }

    const headers = headerRow.map(header => header.trim().toLowerCase());
    const folderIndex = headers.indexOf('foldername');
    const promptIndex = headers.indexOf('prompt');
    if (folderIndex === -1 || promptIndex === -1) {
      this.snackBar.open('CSV must contain "foldername" and "prompt" columns.', 'Close', {duration: 3000});
      return;
    }

    const newPrompts: (SystemMessage & { editing?: boolean })[] = [];
    for (const values of dataRows) {
      const folder = values[folderIndex]?.trim();
      const content = values[promptIndex]?.trim();
      if (!folder || !content) continue;
      newPrompts.push({
        sys_msg_id: crypto.randomUUID(),
        role: 'system',
        content,
        active: true,
        folder,
        editing: false,
      });
    }

    if (newPrompts.length) {
      this.systemPrompts = [...this.systemPrompts, ...newPrompts];
      this.updateFolders();
      this.persistPrompts();
      this.snackBar.open(`Imported ${newPrompts.length} prompts.`, 'Close', {duration: 3000});
    } else {
      this.snackBar.open('No valid prompts found in CSV.', 'Close', {duration: 3000});
    }
  }

  private parseCsvRows(csvContent: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let value = '';
    let quoted = false;

    for (let index = 0; index < csvContent.length; index++) {
      const character = csvContent[index];
      const nextCharacter = csvContent[index + 1];

      if (character === '"') {
        if (quoted && nextCharacter === '"') {
          value += '"';
          index++;
        } else {
          quoted = !quoted;
        }
        continue;
      }

      if (character === ',' && !quoted) {
        row.push(value);
        value = '';
        continue;
      }

      if ((character === '\n' || character === '\r') && !quoted) {
        if (character === '\r' && nextCharacter === '\n') {
          index++;
        }
        row.push(value);
        if (row.some(cell => cell.trim().length > 0)) {
          rows.push(row);
        }
        row = [];
        value = '';
        continue;
      }

      value += character;
    }

    row.push(value);
    if (row.some(cell => cell.trim().length > 0)) {
      rows.push(row);
    }

    return rows;
  }

  importFromJSON(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (!fileInput.files?.length) return;
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result as string;
      this.parseJSON(content);
    };
    reader.readAsText(file);
  }

  parseJSON(jsonContent: string): void {
    try {
      const parsedData: unknown = JSON.parse(jsonContent);
      if (!Array.isArray(parsedData)) {
        this.snackBar.open('JSON must be an array of objects with "folder" and "prompt" properties.', 'Close', {duration: 3000});
        return;
      }
      const newPrompts: (SystemMessage & { editing?: boolean })[] = [];
      for (const item of parsedData) {
        if (!isPromptImportItem(item)) continue;
        newPrompts.push({
          sys_msg_id: crypto.randomUUID(),
          role: 'system',
          content: item.prompt.trim(),
          active: true,
          folder: item.folder.trim(),
          editing: false,
        });
      }
      if (newPrompts.length) {
        this.systemPrompts = [...this.systemPrompts, ...newPrompts];
        this.updateFolders();
        this.persistPrompts();
        this.snackBar.open(`Imported ${newPrompts.length} prompts.`, 'Close', {duration: 3000});
      } else {
        this.snackBar.open('No valid prompts found in JSON.', 'Close', {duration: 3000});
      }
    } catch {
      this.snackBar.open('Invalid JSON format.', 'Close', {duration: 3000});
    }
  }

  exportToJSON(): void {
    const data = this.systemPrompts.map(p => ({
      folder: p.folder,
      prompt: p.content,
    }));
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], {type: 'application/json'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'system-prompts.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}


function isPromptImportItem(value: unknown): value is { folder: string; prompt: string } {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as { folder?: unknown; prompt?: unknown };
  return (
    typeof candidate.folder === 'string' &&
    candidate.folder.trim().length > 0 &&
    typeof candidate.prompt === 'string' &&
    candidate.prompt.trim().length > 0
  );
}
