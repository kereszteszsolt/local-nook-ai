import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConversationDeleteConfirmationComponent } from './conversation-delete-confirmation.component';

describe('ConversationDeleteConfirmationComponent', () => {
  let component: ConversationDeleteConfirmationComponent;
  let fixture: ComponentFixture<ConversationDeleteConfirmationComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ConversationDeleteConfirmationComponent, boolean>>;

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj<MatDialogRef<ConversationDeleteConfirmationComponent, boolean>>('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ConversationDeleteConfirmationComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { heading: 'Delete conversation?', message: 'Delete it?', confirmLabel: 'Delete' } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationDeleteConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('closes with confirmation only when Delete is chosen', () => {
    component.confirm();

    expect(dialogRef.close).toHaveBeenCalledOnceWith(true);
  });
});
