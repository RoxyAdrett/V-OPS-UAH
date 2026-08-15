import { Injectable } from '@angular/core';
import { ScheduleEvent, WEEK_DAYS, WeekDay } from '../models/schedule-event.model';
import { ScheduleService } from './schedule.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ScheduleNotificationService {
  private readonly delivered = new Set<string>();

  constructor(private readonly scheduleService: ScheduleService) {}

  /**
   * Revisa los eventos del equipo y simula alertas cinco minutos antes y al inicio.
   * Sustituye `sendNotification` por el proveedor push/local cuando esté disponible.
   */
  async checkUpcomingEvents(teamId: string, now = new Date()): Promise<void> {
    const events = await firstValueFrom(this.scheduleService.getEventsByTeam(teamId));
    events.forEach((event) => {
      const eventNow = this.getTimeInEventZone(now, event.timezone);
      if (event.day !== eventNow.day) return;
      const [hours, minutes] = event.time.split(':').map(Number);
      const eventMinutes = hours * 60 + minutes;
      const notificationKind = eventMinutes === eventNow.minutes ? 'now' : eventMinutes - 5 === eventNow.minutes ? 'five-minutes' : null;
      if (!notificationKind) return;

      const key = `${event.id}:${now.toDateString()}:${notificationKind}`;
      if (this.delivered.has(key)) return;
      this.delivered.add(key);
      const suffix = notificationKind === 'now' ? 'empieza ahora' : 'en 5 minutos';
      this.sendNotification(teamId, `${event.type[0].toUpperCase()}${event.type.slice(1)} ${suffix}`, event.description);
    });
  }

  private getTimeInEventZone(date: Date, timezone?: string): { day: WeekDay; minutes: number } {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone,
      }).formatToParts(date);
      const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
      const weekday = parts.find((part) => part.type === 'weekday')?.value;
      const dayIndex: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
      return { day: WEEK_DAYS[dayIndex[weekday ?? 'Mon']] as WeekDay, minutes: value('hour') * 60 + value('minute') };
    } catch {
      return { day: WEEK_DAYS[(date.getDay() + 6) % 7] as WeekDay, minutes: date.getHours() * 60 + date.getMinutes() };
    }
  }

  private sendNotification(teamId: string, title: string, body?: string): void {
    // Punto único de integración futura con Capacitor Local Notifications o push notifications.
    console.info('[Schedule notification]', { teamId, title, body });
  }
}
