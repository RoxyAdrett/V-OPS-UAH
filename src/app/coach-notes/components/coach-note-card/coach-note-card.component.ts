import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline } from 'ionicons/icons';
import { CoachNote, TeamUser } from '../../models/coach-note.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-coach-note-card',
  templateUrl: './coach-note-card.component.html',
  styleUrls: ['./coach-note-card.component.scss'],
  imports: [CommonModule, DatePipe, IonButton, IonIcon],
})
export class CoachNoteCardComponent {
  @Input({ required: true }) note!: CoachNote;
  @Input({ required: true }) currentUser!: TeamUser;
  @Output() edit = new EventEmitter<CoachNote>();
  @Output() delete = new EventEmitter<CoachNote>();

  constructor() {
    addIcons({ createOutline, trashOutline });
  }

  get isAuthor(): boolean {
    return this.currentUser.role === 'coach' && this.note.coachId === this.currentUser.userId;
  }

  formatImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const backendBase = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
  }
}
