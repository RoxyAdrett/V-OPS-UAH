import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personAddOutline,
  shieldOutline,
  personCircleOutline,
  trashOutline,
  peopleOutline,
  checkmarkCircleOutline,
  lockClosedOutline
} from 'ionicons/icons';
import { Subscription, timer } from 'rxjs';
import { AuthService, CreateTeamMemberInput, TeamMember } from '../core/services/auth.service';
import { UserRole } from '../coach-notes/models/coach-note.model';

@Component({
  selector: 'app-team-roster',
  templateUrl: './team-roster.page.html',
  styleUrls: ['./team-roster.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonModal,
    IonItem,
    IonLabel,
    IonInput,
    IonSegment,
    IonSegmentButton,
    IonSpinner
  ],
})
export class TeamRosterPage implements OnInit, OnDestroy {
  members: TeamMember[] = [];
  loading = true;
  modalOpen = false;

  // Formulario para crear miembro
  newMemberName = '';
  newMemberEmail = '';
  newMemberPassword = '';
  newMemberRole: UserRole = 'player';
  creating = false;
  errorMessage = '';
  successMessage = '';

  private pollSubscription?: Subscription;

  constructor(
    public readonly authService: AuthService,
    private readonly alertController: AlertController
  ) {
    addIcons({
      personAddOutline,
      shieldOutline,
      personCircleOutline,
      trashOutline,
      peopleOutline,
      checkmarkCircleOutline,
      lockClosedOutline
    });
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  get isCoach(): boolean {
    return this.authService.isCoach;
  }

  get coachCount(): number {
    return this.members.filter((m) => m.role === 'coach').length;
  }

  get playerCount(): number {
    return this.members.filter((m) => m.role === 'player').length;
  }

  ngOnInit(): void {
    void this.loadMembers();
    // Actualizar periódicamente la lista del equipo mientras esta pantalla esté abierta
    this.pollSubscription = timer(6000, 6000).subscribe(() => {
      void this.loadMembers(false);
    });
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }

  async loadMembers(showSpinner = true): Promise<void> {
    if (showSpinner) this.loading = true;
    try {
      this.members = await this.authService.getTeamMembers();
    } catch (err) {
      console.error('Error loading team roster:', err);
    } finally {
      this.loading = false;
    }
  }

  openAddModal(): void {
    if (!this.isCoach) return;
    this.newMemberName = '';
    this.newMemberEmail = '';
    this.newMemberPassword = '';
    this.newMemberRole = 'player';
    this.errorMessage = '';
    this.successMessage = '';
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  async createMember(): Promise<void> {
    if (!this.newMemberName.trim() || !this.newMemberEmail.trim() || !this.newMemberPassword) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }
    if (this.newMemberPassword.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.creating = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const input: CreateTeamMemberInput = {
        name: this.newMemberName.trim(),
        email: this.newMemberEmail.trim(),
        password: this.newMemberPassword,
        role: this.newMemberRole,
      };

      await this.authService.createTeamMember(input);
      this.successMessage = `¡${this.newMemberRole === 'coach' ? 'Coach' : 'Jugador'} ${input.name} añadido al equipo!`;

      // Recargar lista y cerrar modal después de breve delay
      await this.loadMembers(false);
      setTimeout(() => {
        this.closeModal();
      }, 1000);
    } catch (err: any) {
      console.error('Error creating member:', err);
      this.errorMessage = err?.error?.error || err?.message || 'Error al crear el miembro del equipo.';
    } finally {
      this.creating = false;
    }
  }

  async confirmDelete(member: TeamMember): Promise<void> {
    if (!this.isCoach) return;
    if (member.userId === this.currentUser?.userId) {
      const alert = await this.alertController.create({
        header: 'Acción no permitida',
        message: 'No puedes eliminarte a ti mismo de tu propio equipo.',
        buttons: ['Entendido'],
      });
      await alert.present();
      return;
    }

    const alert = await this.alertController.create({
      header: '¿Eliminar miembro?',
      message: `¿Estás seguro de que deseas eliminar a "${member.name}" de la escuadra? Perderá acceso a las notas y horarios del equipo.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            void this.executeDeleteMember(member.userId);
          },
        },
      ],
    });

    await alert.present();
  }

  private async executeDeleteMember(userId: string): Promise<void> {
    try {
      await this.authService.deleteTeamMember(userId);
      this.members = this.members.filter((m) => m.userId !== userId);
    } catch (err: any) {
      alert('Error al eliminar miembro: ' + (err?.error?.error || err?.message || JSON.stringify(err)));
      console.error(err);
    }
  }
}
