export const WEEK_DAYS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];
export type ScheduleEventType = 'clase' | 'scrim' | 'premier';

export interface ScheduleDayNote {
  id: string;
  teamId: string;
  date: string;
  note: string;
  updatedAt: string;
}

/** Evento del horario. En una API, `id` debe venir de la base de datos. */
export interface ScheduleEvent {
  id: string;
  type: ScheduleEventType;
  day: WeekDay;
  /** Hora en formato 24 h: HH:mm. */
  time: string;
  description?: string;
  teamId: string;
  /** Zona IANA opcional, por ejemplo: America/Santiago. */
  timezone?: string;
  /** Anticipación de avisos en minutos. Máximo tres valores. */
  reminderMinutes?: number[];
}

export type ScheduleEventInput = Omit<ScheduleEvent, 'id'>;

export const EVENT_TYPE_LABEL: Record<ScheduleEventType, string> = {
  clase: 'Clase',
  scrim: 'Scrim',
  premier: 'Premier',
};
