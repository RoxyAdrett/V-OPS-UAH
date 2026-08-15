import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, calendarOutline } from 'ionicons/icons';
import { EVENT_TYPE_LABEL, ScheduleEvent, WEEK_DAYS, WeekDay } from '../../models/schedule-event.model';

@Component({
  selector: 'app-schedule-table',
  templateUrl: './schedule-table.component.html',
  styleUrls: ['./schedule-table.component.scss'],
  imports: [CommonModule, IonButton, IonIcon],
})
export class ScheduleTableComponent {
  @Input({ required: true }) events: ScheduleEvent[] = [];
  @Input() isCoach = false;
  @Output() addEvent = new EventEmitter<WeekDay>();
  @Output() eventSelected = new EventEmitter<ScheduleEvent>();

  readonly days = WEEK_DAYS;
  readonly typeLabel = EVENT_TYPE_LABEL;

  constructor() {
    addIcons({ addOutline, calendarOutline });
  }

  eventsFor(day: WeekDay): ScheduleEvent[] {
    return this.events.filter((event) => event.day === day);
  }
}
