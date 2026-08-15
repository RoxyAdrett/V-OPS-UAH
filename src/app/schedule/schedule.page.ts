import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { Observable, Subscription, interval, startWith, timer } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { EventModalComponent } from './components/event-modal/event-modal.component';
import { ScheduleTableComponent } from './components/schedule-table/schedule-table.component';
import { ScheduleEvent, ScheduleEventInput, WeekDay } from './models/schedule-event.model';
import { ScheduleNotificationService } from './services/schedule-notification.service';
import { ScheduleService } from './services/schedule.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
  imports: [AsyncPipe, IonButton, IonContent, IonIcon, ScheduleTableComponent, EventModalComponent],
})
export class SchedulePage implements OnInit, OnDestroy {
  readonly events$: Observable<ScheduleEvent[]> = this.scheduleService.events$;
  modalOpen = false;
  selectedEvent: ScheduleEvent | null = null;
  defaultDay: WeekDay = 'Lunes';
  private pollSubscription?: Subscription;
  private notificationSubscription?: Subscription;

  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly notifications: ScheduleNotificationService,
    private readonly authService: AuthService,
  ) {
    addIcons({ addOutline });
  }

  get teamId(): string {
    return this.authService.currentUser?.teamId ?? '';
  }

  get isCoach(): boolean {
    return this.authService.currentUser?.role === 'coach';
  }

  ngOnInit(): void {
    // Sincronizar automáticamente en segundo plano cada 6 segundos solo mientras esta pestaña esté activa
    this.pollSubscription = timer(0, 6000).subscribe(() => {
      if (this.teamId) {
        void this.scheduleService.refreshEvents();
      }
    });

    // Revisión de notificaciones cada minuto
    this.notificationSubscription = interval(60_000).pipe(startWith(0)).subscribe(() => {
      if (this.teamId) {
        void this.notifications.checkUpcomingEvents(this.teamId);
      }
    });
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
    this.notificationSubscription?.unsubscribe();
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
}
