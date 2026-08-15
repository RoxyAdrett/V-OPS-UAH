import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CoachNote, CoachNoteInput, TeamUser } from '../models/coach-note.model';

@Injectable({ providedIn: 'root' })
export class CoachNotesService {
  private readonly apiUrl = `${environment.apiUrl}/notes`;
  private readonly notesSubject = new BehaviorSubject<CoachNote[]>([]);
  readonly notes$ = this.notesSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  async refreshNotes(): Promise<CoachNote[]> {
    try {
      const notes = await firstValueFrom(this.http.get<CoachNote[]>(this.apiUrl));
      this.notesSubject.next(notes);
      return notes;
    } catch (error) {
      console.warn('Error fetching latest notes:', error);
      return this.notesSubject.value;
    }
  }

  getNotesByTeam(teamId?: string): Observable<CoachNote[]> {
    return this.http.get<CoachNote[]>(this.apiUrl).pipe(
      tap((notes) => this.notesSubject.next(notes))
    );
  }

  async addNote(noteData: CoachNoteInput, coach: TeamUser): Promise<void> {
    this.validate(noteData);
    const newNote = await firstValueFrom(
      this.http.post<CoachNote>(this.apiUrl, noteData)
    );
    const currentNotes = this.notesSubject.value;
    this.notesSubject.next([newNote, ...currentNotes]);
  }

  async updateNote(noteId: string, data: CoachNoteInput, requester: TeamUser): Promise<void> {
    this.validate(data);
    const updatedNote = await firstValueFrom(
      this.http.put<CoachNote>(`${this.apiUrl}/${noteId}`, data)
    );
    const updatedNotes = this.notesSubject.value.map((note) =>
      note.id === noteId ? { ...note, ...updatedNote } : note
    );
    this.notesSubject.next(updatedNotes);
  }

  async deleteNote(noteId: string, requester: TeamUser): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${noteId}`));
    const filteredNotes = this.notesSubject.value.filter((n) => n.id !== noteId);
    this.notesSubject.next(filteredNotes);
  }

  private validate(data: CoachNoteInput): void {
    if (!data.content?.trim() && !data.imageUrl) {
      throw new Error('La nota necesita texto o una imagen.');
    }
    if (data.content && data.content.length > 2000) {
      throw new Error('La nota no puede superar 2000 caracteres.');
    }
  }
}
