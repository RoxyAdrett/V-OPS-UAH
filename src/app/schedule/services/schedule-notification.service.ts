import { Injectable } from '@angular/core';
import { ScheduleEvent, WEEK_DAYS, WeekDay } from '../models/schedule-event.model';
import { ScheduleService } from './schedule.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ScheduleNotificationService {
  private readonly delivered = new Set<string>();

  constructor(private readonly scheduleService: ScheduleService) {}

  get permission(): NotificationPermission | 'unsupported' {
    return 'Notification' in window ? Notification.permission : 'unsupported';
  }

  async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'default') await Notification.requestPermission();
    return Notification.permission;
  }

  async checkUpcomingEvents(teamId: string, now = new Date()): Promise<void> {
    const events = await firstValueFrom(this.scheduleService.getEventsByTeam(teamId));
    events.forEach((event) => {
      const eventNow = this.getTimeInEventZone(now, event.timezone);
      const [hours, minutes] = event.time.split(':').map(Number);
      const eventMinutes = hours * 60 + minutes;
      const currentDayIndex = WEEK_DAYS.indexOf(eventNow.day);
      const eventDayIndex = WEEK_DAYS.indexOf(event.day);
      const daysUntilEvent = (eventDayIndex - currentDayIndex + 7) % 7;
      const minutesUntilEvent = daysUntilEvent * 1440 + eventMinutes - eventNow.minutes;
      const reminders = event.reminderMinutes?.length ? event.reminderMinutes : [300, 30, 10];

      reminders.slice(0, 3).forEach((reminderMinutes) => {
        if (minutesUntilEvent > reminderMinutes || minutesUntilEvent < reminderMinutes - 2) return;

        const key = `${event.id}:${this.getDateKey(now, event.timezone)}:${reminderMinutes}`;
        if (this.delivered.has(key)) return;
        this.delivered.add(key);
        const title = `${this.capitalize(event.type)} en ${this.formatReminder(reminderMinutes)}`;
        this.sendNotification(teamId, title, event.description || 'Revisa el horario del equipo.');
      });
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

  private sendNotification(teamId: string, title: string, body: string): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const notification = new Notification(title, {
      body,
      tag: `schedule:${teamId}:${title}`,
      icon: 'assets/icon/favicon.png',
    });
    notification.onclick = () => window.focus();
  }

  private formatReminder(minutes: number): string {
    if (minutes % 60 === 0) return `${minutes / 60} hora${minutes === 60 ? '' : 's'}`;
    if (minutes < 60) return `${minutes} minutos`;
    return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private getDateKey(date: Date, timezone?: string): string {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
    } catch {
      return date.toISOString().slice(0, 10);
    }
  }
}
