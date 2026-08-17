import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ScheduleEvent, ScheduleEventInput } from '../models/schedule-event.model';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly apiUrl = `${environment.apiUrl}/schedule`;
  private readonly eventsSubject = new BehaviorSubject<ScheduleEvent[]>([]);
  readonly events$ = this.eventsSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  async refreshEvents(): Promise<ScheduleEvent[]> {
    try {
      const events = await firstValueFrom(this.http.get<ScheduleEvent[]>(this.apiUrl));
      this.eventsSubject.next(events);
      return events;
    } catch (error) {
      console.warn('Error fetching latest schedule events:', error);
      return this.eventsSubject.value;
    }
  }

  getEventsByTeam(teamId?: string): Observable<ScheduleEvent[]> {
    return this.http.get<ScheduleEvent[]>(this.apiUrl).pipe(
      tap((events) => this.eventsSubject.next(events))
    );
  }

  async addEvent(event: ScheduleEventInput): Promise<void> {
    const newEvent = await firstValueFrom(
      this.http.post<ScheduleEvent>(this.apiUrl, event)
    );
    const currentEvents = this.eventsSubject.value;
    this.eventsSubject.next([...currentEvents, newEvent]);
  }

  async updateEvent(eventId: string, data: Partial<Omit<ScheduleEvent, 'id'>>, teamId: string): Promise<void> {
    const updatedEvent = await firstValueFrom(
      this.http.put<ScheduleEvent>(`${this.apiUrl}/${eventId}`, data)
    );
    const updatedEvents = this.eventsSubject.value.map((event) =>
      event.id === eventId ? { ...event, ...updatedEvent } : event
    );
    this.eventsSubject.next(updatedEvents);
  }

  async deleteEvent(eventId: string, teamId: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${eventId}`));
    const filteredEvents = this.eventsSubject.value.filter((e) => e.id !== eventId);
    this.eventsSubject.next(filteredEvents);
  }
}
