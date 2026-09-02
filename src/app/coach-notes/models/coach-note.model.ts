export type UserRole = 'coach' | 'assistant-coach' | 'analyst' | 'player';

export interface TeamUser {
  userId: string;
  teamId: string;
  role: UserRole;
  name: string;
}

export interface CoachNote {
  id: string;
  teamId: string;
  coachId: string;
  coachName: string;
  title?: string;
  content: string;
  /** URL remota o data URL temporal elegida desde el dispositivo. */
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  visibility?: 'team' | 'private';
}

export type CoachNoteInput = Pick<CoachNote, 'title' | 'content' | 'imageUrl' | 'visibility'>;
