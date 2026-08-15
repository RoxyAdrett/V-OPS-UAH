import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonModal, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { CoachNote, CoachNoteInput } from '../../models/coach-note.model';

const MAX_IMAGE_SIZE_BYTES = 1_500_000;

@Component({
  selector: 'app-new-note-modal', templateUrl: './new-note-modal.component.html', styleUrls: ['./new-note-modal.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonModal, IonTextarea, IonTitle, IonToolbar],
})
export class NewNoteModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() note: CoachNote | null = null;
  @Output() dismissed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<{ id?: string; data: CoachNoteInput; imageFile?: File }>();

  readonly form;
  imagePreview: string | null = null;
  imageError = '';
  private imageFile?: File;

  constructor(formBuilder: FormBuilder) {
    this.form = formBuilder.nonNullable.group({ title: ['', [Validators.maxLength(120)]], content: ['', [Validators.maxLength(2000)]], imageUrl: [''] });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['isOpen']?.currentValue) return;
    this.imagePreview = this.note?.imageUrl ?? null;
    this.imageFile = undefined;
    this.imageError = '';
    this.form.reset({ title: this.note?.title ?? '', content: this.note?.content ?? '', imageUrl: this.note?.imageUrl ?? '' });
  }

  imageUrlChanged(): void {
    const url = this.form.controls.imageUrl.value.trim();
    this.imagePreview = url || null;
    this.imageFile = undefined;
    this.imageError = '';
  }

  readImage(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > MAX_IMAGE_SIZE_BYTES) {
      this.imageError = 'Elige una imagen de hasta 1,5 MB.';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = String(reader.result);
      this.form.controls.imageUrl.setValue('');
      this.imageFile = file;
      this.imageError = '';
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void { this.imagePreview = null; this.imageFile = undefined; this.form.controls.imageUrl.setValue(''); }

  save(): void {
    const value = this.form.getRawValue();
    const data: CoachNoteInput = { title: value.title.trim() || undefined, content: value.content.trim(), imageUrl: value.imageUrl.trim() || null };
    if (this.form.invalid || (!data.content && !data.imageUrl && !this.imageFile)) {
      this.form.controls.content.markAsTouched();
      return;
    }
    this.saved.emit({ id: this.note?.id, data, imageFile: this.imageFile });
  }
}
