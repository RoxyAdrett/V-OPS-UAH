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
  IonTextarea,
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
  createOutline,
  flashOutline,
  flagOutline,
  eyeOutline,
  documentTextOutline,
  closeOutline,
  saveOutline,
  ribbonOutline
} from 'ionicons/icons';
import { Subscription, timer } from 'rxjs';
import {
  AuthService,
  CreateTeamMemberInput,
  GameRole,
  LeadershipRole,
  MemberStatus,
  TeamMember,
  UpdateMemberInput
} from '../core/services/auth.service';
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
    IonTextarea,
    IonSegment,
    IonSegmentButton,
    IonSpinner
  ],
})
export class TeamRosterPage implements OnInit, OnDestroy {
  members: TeamMember[] = [];
  loading = true;
  filterTab: 'todos' | 'activos' | 'desactivados' | 'fuera' = 'todos';

  // Modal 1: Crear Miembro
  addModalOpen = false;
  newMemberName = '';
  newMemberEmail = '';
  newMemberPassword = '';
  newMemberRole: UserRole = 'player';
  creating = false;
  createErrorMessage = '';
  createSuccessMessage = '';

  // Modal 2: Editar Ficha del Jugador (Coach)
  editModalOpen = false;
  selectedMember: TeamMember | null = null;
  editName = '';
  editStatus: MemberStatus = 'activo';
  editLeadership: LeadershipRole = 'miembro';
  editGameRoles: GameRole[] = [];
  editAgents: string[] = [];
  editNotes = '';
  savingEdit = false;
  editErrorMessage = '';
  editSuccessMessage = '';

  // Roles disponibles en Valorant
  readonly availableGameRoles: GameRole[] = [
    'Duelista',
    'Iniciador',
    'Controlador',
    'Centinela',
    'Flex'
  ];

  readonly availableAgents: string[] = [
    'Astra', 'Breach', 'Brimstone', 'Chamber', 'Clove', 'Cypher', 'Deadlock',
    'Fade', 'Gekko', 'Harbor', 'Iso', 'Jett', 'KAY/O', 'Killjoy', 'Neon',
    'Omen', 'Phoenix', 'Raze', 'Reyna', 'Sage', 'Skye', 'Sova', 'Tejo',
    'Viper', 'Vyse', 'Waylay', 'Yoru'
  ];

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
      createOutline,
      flashOutline,
      flagOutline,
      eyeOutline,
      documentTextOutline,
      closeOutline,
      saveOutline,
      ribbonOutline
    });
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  get isCoach(): boolean {
    return this.authService.isCoach;
  }

  get activeCount(): number {
    return this.members.filter((m) => (m.status || 'activo') === 'activo').length;
  }

  get inactiveCount(): number {
    return this.members.filter((m) => m.status === 'desactivado').length;
  }

  get outsideCount(): number {
    return this.members.filter((m) => m.status === 'fuera_del_team').length;
  }

  get filteredMembers(): TeamMember[] {
    switch (this.filterTab) {
      case 'activos':
        return this.members.filter((m) => (m.status || 'activo') === 'activo');
      case 'desactivados':
        return this.members.filter((m) => m.status === 'desactivado');
      case 'fuera':
        return this.members.filter((m) => m.status === 'fuera_del_team');
      default:
        return this.members;
    }
  }

  ngOnInit(): void {
    void this.loadMembers();
    this.pollSubscription = timer(6000, 6000).subscribe(() => {
      // No recargar automáticamente si un modal está abierto para no interrumpir la edición
      if (!this.addModalOpen && !this.editModalOpen) {
        void this.loadMembers(false);
      }
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

  // --- Modal Crear ---
  openAddModal(): void {
    if (!this.isCoach) return;
    this.newMemberName = '';
    this.newMemberEmail = '';
    this.newMemberPassword = '';
    this.newMemberRole = 'player';
    this.createErrorMessage = '';
    this.createSuccessMessage = '';
    this.addModalOpen = true;
  }

  closeAddModal(): void {
    this.addModalOpen = false;
  }

  async createMember(): Promise<void> {
    if (!this.newMemberName.trim() || !this.newMemberEmail.trim() || !this.newMemberPassword) {
      this.createErrorMessage = 'Todos los campos son obligatorios.';
      return;
    }
    if (this.newMemberPassword.length < 6) {
      this.createErrorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.creating = true;
    this.createErrorMessage = '';
    this.createSuccessMessage = '';

    try {
      const input: CreateTeamMemberInput = {
        name: this.newMemberName.trim(),
        email: this.newMemberEmail.trim(),
        password: this.newMemberPassword,
        role: this.newMemberRole,
      };

      await this.authService.createTeamMember(input);
      this.createSuccessMessage = `¡${this.newMemberRole === 'coach' ? 'Coach' : 'Jugador'} ${input.name} añadido al equipo!`;

      await this.loadMembers(false);
      setTimeout(() => {
        this.closeAddModal();
      }, 900);
    } catch (err: any) {
      console.error('Error creating member:', err);
      this.createErrorMessage = err?.error?.error || err?.message || 'Error al crear el miembro del equipo.';
    } finally {
      this.creating = false;
    }
  }

  // --- Modal Editar Ficha ---
  openEditModal(member: TeamMember): void {
    if (!this.isCoach) return;
    this.selectedMember = member;
    this.editName = member.name || '';
    this.editStatus = member.status || 'activo';
    this.editLeadership = member.leadership || (member.role === 'coach' ? 'coach' : 'miembro');
    this.editGameRoles = member.gameRoles ? [...member.gameRoles] : [];
    this.editAgents = member.agents ? [...member.agents] : [];
    this.editNotes = member.notes || '';
    this.editErrorMessage = '';
    this.editSuccessMessage = '';
    this.editModalOpen = true;
  }

  closeEditModal(): void {
    this.editModalOpen = false;
    this.selectedMember = null;
  }

  toggleGameRole(role: GameRole): void {
    const index = this.editGameRoles.indexOf(role);
    if (index >= 0) {
      this.editGameRoles.splice(index, 1);
    } else {
      this.editGameRoles.push(role);
    }
  }

  isGameRoleSelected(role: GameRole): boolean {
    return this.editGameRoles.includes(role);
  }

  toggleAgent(agent: string): void {
    const index = this.editAgents.indexOf(agent);
    if (index >= 0) {
      this.editAgents.splice(index, 1);
    } else {
      this.editAgents.push(agent);
    }
  }

  isAgentSelected(agent: string): boolean {
    return this.editAgents.includes(agent);
  }

  async saveEditMember(): Promise<void> {
    if (!this.selectedMember) return;
    if (!this.editName.trim()) {
      this.editErrorMessage = 'El nombre no puede estar vacío.';
      return;
    }

    this.savingEdit = true;
    this.editErrorMessage = '';
    this.editSuccessMessage = '';

    try {
      const updateData: UpdateMemberInput = {
        name: this.editName.trim(),
        status: this.editStatus,
        leadership: this.editLeadership,
        gameRoles: this.editGameRoles,
        agents: this.editAgents,
        notes: this.editNotes.trim(),
      };

      await this.authService.updateTeamMember(this.selectedMember.userId, updateData);

      // Actualizar estado local inmediatamente
      const idx = this.members.findIndex((m) => m.userId === this.selectedMember?.userId);
      if (idx >= 0) {
        this.members[idx] = {
          ...this.members[idx],
          ...updateData,
        };
      }

      this.editSuccessMessage = '¡Ficha del jugador actualizada con éxito!';
      setTimeout(() => {
        this.closeEditModal();
      }, 700);
    } catch (err: any) {
      console.error('Error updating member:', err);
      this.editErrorMessage = err?.error?.error || err?.message || 'Error al guardar los cambios.';
    } finally {
      this.savingEdit = false;
    }
  }

  // --- Eliminar Miembro ---
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

  getLeadershipLabel(leadership?: LeadershipRole): string {
    switch (leadership) {
      case 'igl':
        return 'IGL';
      case 'co_igl':
        return 'Co-IGL';
      case 'coach':
        return 'Coach';
      default:
        return 'Miembro';
    }
  }

  getStatusLabel(status?: MemberStatus): string {
    switch (status) {
      case 'desactivado':
        return 'Desactivado / Banca';
      case 'fuera_del_team':
        return 'Fuera del Team';
      default:
        return 'Activo';
    }
  }
}
