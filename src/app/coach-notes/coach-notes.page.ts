import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { Observable, Subscription, timer } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { CoachNotesFeedComponent } from './components/coach-notes-feed/coach-notes-feed.component';
import { NewNoteModalComponent } from './components/new-note-modal/new-note-modal.component';
import { CoachNote, CoachNoteInput, TeamUser } from './models/coach-note.model';
import { CoachNotesService } from './services/coach-notes.service';
import { NoteImageService } from './services/note-image.service';

@Component({
  selector: 'app-coach-notes',
  templateUrl: './coach-notes.page.html',
  styleUrls: ['./coach-notes.page.scss'],
  imports: [AsyncPipe, IonButton, IonContent, IonIcon, CoachNotesFeedComponent, NewNoteModalComponent],
})
export class CoachNotesPage implements OnInit, OnDestroy {
  readonly notes$: Observable<CoachNote[]> = this.notesService.notes$;
  modalOpen = false;
  selectedNote: CoachNote | null = null;
  private pollSubscription?: Subscription;

  constructor(
    private readonly notesService: CoachNotesService,
    private readonly authService: AuthService,
    private readonly imageService: NoteImageService,
    private readonly alertController: AlertController
  ) {
    addIcons({ addOutline });
  }

  get currentUser(): TeamUser {
    return this.authService.currentUser ?? { userId: '', teamId: '', role: 'player', name: 'Jugador' };
  }

  get isCoach(): boolean {
    return this.currentUser.role === 'coach';
  }

  get canManageNotes(): boolean {
    return ['coach', 'assistant-coach', 'analyst'].includes(this.currentUser.role);
  }

  ngOnInit(): void {
    this.pollSubscription = timer(0, 6000).subscribe(() => {
      if (this.currentUser.teamId) {
        void this.notesService.refreshNotes();
      }
    });
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }

  openNew(): void {
    if (this.canManageNotes) {
      this.selectedNote = null;
      this.modalOpen = true;
    }
  }

  openEdit(note: CoachNote): void {
    if (this.isAuthor(note)) {
      this.selectedNote = note;
      this.modalOpen = true;
    }
  }

  closeModal(): void {
    this.modalOpen = false;
    this.selectedNote = null;
  }

  async saveNote(change: { id?: string; data: CoachNoteInput; imageFile?: File }): Promise<void> {
    try {
      const imageUrl = change.imageFile
        ? await this.imageService.upload(change.imageFile, this.currentUser.teamId)
        : change.data.imageUrl;
      const data = { ...change.data, imageUrl };
      if (change.id) {
        await this.notesService.updateNote(change.id, data, this.currentUser);
      } else {
        await this.notesService.addNote(data, this.currentUser);
      }
      this.closeModal();
    } catch (err: any) {
      alert('Error al guardar la nota: ' + (err.message || JSON.stringify(err)));
      console.error(err);
    }
  }

  async requestDelete(note: CoachNote): Promise<void> {
    if (!this.isAuthor(note)) return;

    const alert = await this.alertController.create({
      header: '¿Eliminar nota?',
      message: `¿Estás seguro de que deseas eliminar esta nota táctica? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            void this.executeDeleteNote(note.id);
          },
        },
      ],
    });

    await alert.present();
  }

  private async executeDeleteNote(noteId: string): Promise<void> {
    try {
      await this.notesService.deleteNote(noteId, this.currentUser);
    } catch (err: any) {
      alert('Error al eliminar la nota: ' + (err?.message || JSON.stringify(err)));
      console.error(err);
    }
  }

  private isAuthor(note: CoachNote): boolean {
    return this.canManageNotes && note.coachId === this.currentUser.userId && note.teamId === this.currentUser.teamId;
  }
}
