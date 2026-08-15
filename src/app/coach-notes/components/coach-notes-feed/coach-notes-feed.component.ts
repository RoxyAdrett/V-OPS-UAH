import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CoachNoteCardComponent } from '../coach-note-card/coach-note-card.component';
import { CoachNote, TeamUser } from '../../models/coach-note.model';

@Component({ selector: 'app-coach-notes-feed', templateUrl: './coach-notes-feed.component.html', styleUrls: ['./coach-notes-feed.component.scss'], imports: [CoachNoteCardComponent] })
export class CoachNotesFeedComponent {
  @Input({ required: true }) notes: CoachNote[] = [];
  @Input({ required: true }) currentUser!: TeamUser;
  @Output() edit = new EventEmitter<CoachNote>();
  @Output() delete = new EventEmitter<CoachNote>();
}
