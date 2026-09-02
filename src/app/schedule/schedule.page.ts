import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, chevronBackOutline, chevronForwardOutline, documentTextOutline } from 'ionicons/icons';
import { Observable, Subscription, interval, startWith, timer } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { EventModalComponent } from './components/event-modal/event-modal.component';
import { ScheduleTableComponent } from './components/schedule-table/schedule-table.component';
import { ScheduleDayNote, ScheduleEvent, ScheduleEventInput, WeekDay } from './models/schedule-event.model';
import { ScheduleNotificationService } from './services/schedule-notification.service';
import { ScheduleService } from './services/schedule.service';
import { GoogleCalendarService, GoogleCalendarEvent } from './services/google-calendar.service';
import { createMonthGrid, formatDateKey, isSameDay, isInCurrentMonth } from './utils/schedule.utils';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
  imports: [AsyncPipe, IonButton, IonContent, IonIcon, ScheduleTableComponent, EventModalComponent],
})
export class SchedulePage implements OnInit, OnDestroy {
  readonly events$: Observable<ScheduleEvent[]> = this.scheduleService.events$;
  readonly calendarWeekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  readonly notesStorageKey = 'valoplant.schedule.notes';

  modalOpen = false;
  selectedEvent: ScheduleEvent | null = null;
  defaultDay: WeekDay = 'Lunes';
  selectedDate = new Date();
  currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  draftNote = '';
  dayNotes: ScheduleDayNote[] = [];
  googleCalendarEvents: GoogleCalendarEvent[] = [];
  googleCalendarConnected = false;
  googleCalendarLoading = false;
  private pollSubscription?: Subscription;
  private notificationSubscription?: Subscription;
  private googleCalendarSubscription?: Subscription;

  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly notifications: ScheduleNotificationService,
    private readonly authService: AuthService,
    private readonly googleCalendarService: GoogleCalendarService,
  ) {
    addIcons({ addOutline, chevronBackOutline, chevronForwardOutline, documentTextOutline });
  }

  get teamId(): string {
    return this.authService.currentUser?.teamId ?? '';
  }

  get isCoach(): boolean {
    return this.authService.currentUser?.role === 'coach';
  }

  get notificationPermission(): NotificationPermission | 'unsupported' {
    return this.notifications.permission;
  }

  async enableNotifications(): Promise<void> {
    await this.notifications.requestPermission();
  }

  get calendarDays(): Date[] {
    return createMonthGrid(this.currentMonth);
  }

  get selectedDateLabel(): string {
    return this.selectedDate.toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  get currentMonthLabel(): string {
    return this.currentMonth.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  }

  get selectedDayNote(): ScheduleDayNote | undefined {
    return this.dayNotes.find((note) => note.date === formatDateKey(this.selectedDate));
  }

  ngOnInit(): void {
    this.loadNotes();
    this.syncDraftNote();

    // Initialize Google Calendar authentication status
    this.googleCalendarSubscription = this.googleCalendarService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.googleCalendarConnected = isAuthenticated;
        if (isAuthenticated && this.teamId) {
          void this.loadGoogleCalendarEvents();
        }
      }
    );

    // Check if returning from Google OAuth callback
    this.handleGoogleCallbackIfPresent();

    this.pollSubscription = timer(0, 6000).subscribe(() => {
      if (this.teamId) {
        void this.scheduleService.refreshEvents();
      }
    });

    this.notificationSubscription = interval(60_000).pipe(startWith(0)).subscribe(() => {
      if (this.teamId) {
        void this.notifications.checkUpcomingEvents(this.teamId);
      }
    });
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
    this.notificationSubscription?.unsubscribe();
    this.googleCalendarSubscription?.unsubscribe();
  }

  openCreate(day: WeekDay = 'Lunes'): void {
    if (!this.isCoach) return;
    this.selectedEvent = null;
    this.defaultDay = day;
    this.modalOpen = true;
  }

  openEdit(event: ScheduleEvent): void {
    if (!this.isCoach) return;
    this.selectedEvent = event;
    this.defaultDay = event.day;
    this.modalOpen = true;
  }

  async saveEvent(change: { id?: string; data: ScheduleEventInput }): Promise<void> {
    try {
      if (change.id) {
        await this.scheduleService.updateEvent(change.id, change.data, this.teamId);
      } else {
        await this.scheduleService.addEvent(change.data);
      }
      this.closeModal();
    } catch (err: any) {
      alert('Error al guardar el horario: ' + (err.message || JSON.stringify(err)));
      console.error(err);
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.scheduleService.deleteEvent(eventId, this.teamId);
    this.closeModal();
  }

  closeModal(): void {
    this.modalOpen = false;
    this.selectedEvent = null;
  }

  changeMonth(offset: number): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + offset, 1);
  }

  selectDate(date: Date): void {
    this.selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    this.syncDraftNote();
  }

  saveDailyNote(): void {
    if (!this.isCoach) return;

    const trimmed = this.draftNote.trim();
    const dateKey = formatDateKey(this.selectedDate);

    if (!trimmed) {
      this.deleteDailyNote();
      return;
    }

    const existing = this.selectedDayNote;
    const updated: ScheduleDayNote = {
      id: existing?.id ?? this.generateNoteId(),
      teamId: this.teamId,
      date: dateKey,
      note: trimmed,
      updatedAt: new Date().toISOString(),
    };

    this.dayNotes = existing
      ? this.dayNotes.map((note) => (note.id === existing.id ? updated : note))
      : [...this.dayNotes, updated];

    this.persistNotes();
    this.syncDraftNote();
  }

  deleteDailyNote(): void {
    if (!this.isCoach) return;

    const selected = this.selectedDayNote;
    if (!selected) {
      this.draftNote = '';
      return;
    }

    this.dayNotes = this.dayNotes.filter((note) => note.id !== selected.id);
    this.persistNotes();
    this.draftNote = '';
  }

  hasNoteOn(date: Date): boolean {
    return this.dayNotes.some((note) => note.date === formatDateKey(date));
  }

  isSelectedDay(date: Date): boolean {
    return isSameDay(date, this.selectedDate);
  }

  isToday(date: Date): boolean {
    return isSameDay(date, new Date());
  }

  isInCurrentMonth(date: Date): boolean {
    return isInCurrentMonth(date, this.currentMonth);
  }

  private loadNotes(): void {
    const storageKey = `${this.notesStorageKey}.${this.teamId || 'sin-equipo'}`;
    const raw = localStorage.getItem(storageKey);

    if (!raw) {
      this.dayNotes = [];
      return;
    }

    try {
      const parsed = JSON.parse(raw) as ScheduleDayNote[];
      this.dayNotes = Array.isArray(parsed) ? parsed : [];
    } catch {
      this.dayNotes = [];
    }
  }

  private persistNotes(): void {
    const storageKey = `${this.notesStorageKey}.${this.teamId || 'sin-equipo'}`;
    localStorage.setItem(storageKey, JSON.stringify(this.dayNotes));
  }

  private syncDraftNote(): void {
    this.draftNote = this.selectedDayNote?.note ?? '';
  }

  private generateNoteId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private handleGoogleCallbackIfPresent(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code && this.teamId) {
      this.googleCalendarLoading = true;
      this.googleCalendarService.handleGoogleCallback(code, this.teamId).subscribe({
        next: () => {
          this.googleCalendarLoading = false;
          window.history.replaceState({}, document.title, window.location.pathname);
          void this.loadGoogleCalendarEvents();
        },
        error: (err) => {
          this.googleCalendarLoading = false;
          console.error('Error connecting Google Calendar:', err);
          alert('Error al conectar Google Calendar: ' + err.message);
        }
      });
    }
  }

  private async loadGoogleCalendarEvents(): Promise<void> {
    if (!this.googleCalendarConnected || !this.teamId) return;

    try {
      const yearMonth = this.currentMonth.toISOString().slice(0, 7);
      this.googleCalendarService.getGoogleCalendarEvents(this.teamId, yearMonth).subscribe({
        next: (events) => {
          this.googleCalendarEvents = events;
        },
        error: (err) => {
          console.error('Error loading Google Calendar events:', err);
        }
      });
    } catch (err) {
      console.error('Error in loadGoogleCalendarEvents:', err);
    }
  }

  connectGoogleCalendar(): void {
    this.googleCalendarService.initiateGoogleLogin();
  }

  disconnectGoogleCalendar(): void {
    this.googleCalendarService.logout();
    this.googleCalendarEvents = [];
    this.googleCalendarConnected = false;
  }
}
