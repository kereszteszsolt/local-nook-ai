import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChatFacade } from '../../application/chat-facade.service';
import { SystemMessage } from '../../models/message.model';
import { SystemPromptSettingsComponent } from './system-prompt-settings.component';

describe('SystemPromptSettingsComponent', () => {
  let component: SystemPromptSettingsComponent;
  let fixture: ComponentFixture<SystemPromptSettingsComponent>;
  let saveSystemPrompts: jasmine.Spy;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const initialPrompts: SystemMessage[] = [
    {
      sys_msg_id: 'prompt-1',
      role: 'system',
      content: 'Be concise.',
      active: true,
      folder: 'General',
    },
  ];

  beforeEach(async () => {
    saveSystemPrompts = jasmine.createSpy('saveSystemPrompts');
    snackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    const chatFacade = {
      systemPromptsSignal: signal(initialPrompts).asReadonly(),
      loadSystemPrompts: jasmine.createSpy('loadSystemPrompts'),
      saveSystemPrompts,
    };

    await TestBed.configureTestingModule({
      imports: [SystemPromptSettingsComponent, NoopAnimationsModule],
      providers: [
        { provide: ChatFacade, useValue: chatFacade },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemPromptSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads prompt folders from the facade', () => {
    expect(component.folders).toEqual(['General']);
    expect(component.systemPrompts[0].content).toBe('Be concise.');
  });

  it('imports quoted CSV fields containing commas and line breaks', () => {
    component.parseCSV('foldername,prompt\r\nGeneral,"Use commas, and\nnew lines"\r\n');

    const savedPrompts = saveSystemPrompts.calls.mostRecent().args[0] as SystemMessage[];
    expect(savedPrompts.at(-1)).toEqual(jasmine.objectContaining({
      folder: 'General',
      content: 'Use commas, and\nnew lines',
      active: true,
    }));
    expect(snackBar.open).toHaveBeenCalledWith('Imported 1 prompts.', 'Close', { duration: 3000 });
  });

  it('rejects JSON values that do not match the import contract', () => {
    component.parseJSON('[{"folder":42,"prompt":"Invalid"}]');
    expect(saveSystemPrompts).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('No valid prompts found in JSON.', 'Close', {
      duration: 3000,
    });
  });
});
