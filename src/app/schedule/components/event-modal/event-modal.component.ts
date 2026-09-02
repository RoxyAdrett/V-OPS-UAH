import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { EVENT_TYPE_LABEL, ScheduleEvent, ScheduleEventInput, WEEK_DAYS, WeekDay } from '../../models/schedule-event.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-event-modal',
  templateUrl: './event-modal.component.html',
  styleUrls: ['./event-modal.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonTextarea
  ],
})
export class EventModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() event: ScheduleEvent | null = null;
  @Input() teamId = '';
  @Input() defaultDay: WeekDay = 'Lunes';
  @Output() dismissed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<{ id?: string; data: ScheduleEventInput }>();
  @Output() deleted = new EventEmitter<string>();

  readonly days = WEEK_DAYS;
  readonly types = Object.entries(EVENT_TYPE_LABEL);
  readonly form;

  constructor(
    formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly alertController: AlertController
  ) {
    this.form = formBuilder.nonNullable.group({
      type: ['clase' as ScheduleEvent['type'], Validators.required],
      day: ['Lunes' as WeekDay, Validators.required],
      time: [
        '18:00',
        [
          Validators.required,
          Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        ]
      ],
      description: [''],
      timezone: [Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santiago'],
      reminder1: [300, [Validators.min(1), Validators.max(10080)]],
      reminder2: [30, [Validators.min(1), Validators.max(10080)]],
      reminder3: [10, [Validators.min(1), Validators.max(10080)]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue) {
      this.form.reset(
        this.event
          ? {
              type: this.event.type,
              day: this.event.day,
              time: this.event.time || '18:00',
              description: this.event.description ?? '',
              timezone: this.event.timezone ?? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santiago')
              , reminder1: this.event.reminderMinutes?.[0] ?? 300,
              reminder2: this.event.reminderMinutes?.[1] ?? 30,
              reminder3: this.event.reminderMinutes?.[2] ?? 10
            }
          : {
              type: 'clase',
              day: this.defaultDay,
              time: '18:00',
              description: '',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santiago'
              , reminder1: 300,
              reminder2: 30,
              reminder3: 10
            }
      );
    }
  }

  save(): void {
    const currentTeam = this.teamId || this.authService.currentUser?.teamId || '';
    if (this.form.invalid || !currentTeam) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const formattedTime = value.time.length > 5 ? value.time.substring(0, 5) : value.time;
    const reminderMinutes = [value.reminder1, value.reminder2, value.reminder3]
      .filter((minutes) => Number.isFinite(minutes) && minutes > 0)
      .map((minutes) => Number(minutes))
      .filter((minutes, index, reminders) => reminders.indexOf(minutes) === index)
      .sort((a, b) => b - a);

    this.saved.emit({
      id: this.event?.id,
      data: {
        ...value,
        time: formattedTime,
        description: value.description.trim() || undefined,
        timezone: value.timezone.trim() || undefined,
        teamId: currentTeam,
        reminderMinutes,
      },
    });
  }

  async confirmDelete(): Promise<void> {
    if (!this.event) return;

    const alert = await this.alertController.create({
      header: '¿Eliminar evento?',
      message: `¿Estás seguro de que deseas eliminar este evento de horario? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            if (this.event) {
              this.deleted.emit(this.event.id);
            }
          },
        },
      ],
    });

    await alert.present();
  }
}
