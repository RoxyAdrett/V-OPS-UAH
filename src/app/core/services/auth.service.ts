import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FirebaseApp, FirebaseOptions, deleteApp, getApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  User,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { firebaseConfig } from '../../../environments/firebase.config';
import { environment } from '../../../environments/environment';
import { TeamUser, UserRole } from '../../coach-notes/models/coach-note.model';

export const DEFAULT_COACH_SECRET = 'sakura123';

export type MemberStatus = 'activo' | 'desactivado' | 'fuera_del_team';
export type LeadershipRole = 'igl' | 'co_igl' | 'miembro' | 'coach';
export type GameRole = 'Duelista' | 'Iniciador' | 'Controlador' | 'Centinela' | 'Flex';

export interface LoginCredentials {
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  teamId: string;
  role: UserRole;
  coachSecretKey: string;
}

export interface TeamMember {
  userId: string;
  name: string;
  role: UserRole;
  teamId: string;
  status?: MemberStatus;
  leadership?: LeadershipRole;
  gameRoles?: GameRole[];
  agents?: string[];
  notes?: string;
  createdAt?: string;
}

export interface CreateTeamMemberInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateMemberInput {
  name?: string;
  role?: UserRole;
  status?: MemberStatus;
  leadership?: LeadershipRole;
  gameRoles?: GameRole[];
  agents?: string[];
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly app: FirebaseApp;
  readonly auth: Auth;
  readonly firestore: Firestore;
  private readonly userSubject = new BehaviorSubject<TeamUser | null>(null);
  readonly user$ = this.userSubject.asObservable();

  private readonly readySubject = new BehaviorSubject<boolean>(false);
  readonly authStateReady$: Observable<boolean> = this.readySubject.pipe(
    filter((ready) => ready === true)
  );

  constructor(private readonly http: HttpClient) {
    this.app = this.getApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);

    void setPersistence(this.auth, browserLocalPersistence);

    onAuthStateChanged(this.auth, async (user) => {
      await this.loadProfile(user);
      this.readySubject.next(true);
    });
  }

  get currentUser(): TeamUser | null {
    return this.userSubject.value;
  }

  get isCoach(): boolean {
    return ['coach', 'assistant-coach', 'analyst'].includes(this.userSubject.value?.role || '');
  }

  get isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }

  async login(credentials: LoginCredentials): Promise<TeamUser> {
    if (!firebaseConfig.apiKey) {
      throw new Error('Configura Firebase en src/environments/firebase.config.ts.');
    }

    const credential = await signInWithEmailAndPassword(
      this.auth,
      credentials.email,
      credentials.password
    );

    const profile = await this.readProfile(credential.user);

    if (credentials.role && profile.role !== credentials.role) {
      await signOut(this.auth);
      throw new Error(
        credentials.role === 'coach'
          ? 'Esta cuenta no tiene rol de coach.'
          : 'Esta cuenta no corresponde a un jugador.'
      );
    }

    this.userSubject.next(profile);
    return profile;
  }

  // 1. Registro de Coach con clave secreta y consumo de POST /api/auth/register-profile
  async registerCoach(data: RegisterCredentials): Promise<TeamUser> {
    if (!firebaseConfig.apiKey) {
      throw new Error('Configura Firebase en src/environments/firebase.config.ts.');
    }

    // Validar clave secreta de Coach
    if (!data.coachSecretKey || data.coachSecretKey.trim() !== DEFAULT_COACH_SECRET) {
      throw new Error('Clave secreta de Coach incorrecta. Solo los coaches autorizados pueden crear cuentas.');
    }

    // Crear cuenta en Firebase Auth
    const credential = await createUserWithEmailAndPassword(
      this.auth,
      data.email,
      data.password
    );

    const uid = credential.user.uid;
    const name = data.name.trim();
    const teamId = data.teamId.trim().toLowerCase();

    const userProfile: TeamUser = {
      userId: uid,
      name,
      teamId,
      role: 'coach',
    };

    // Consumir API: POST /api/auth/register-profile
    const payload = {
      uid,
      name,
      teamId,
      role: 'coach'
    };

    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/auth/register-profile`, payload)
      );
    } catch (apiErr) {
      console.warn('POST /auth/register-profile note:', apiErr);
    }

    // Asegurar documentos directamente en Firestore
    try {
      await setDoc(doc(this.firestore, 'users', uid), {
        name,
        teamId,
        role: 'coach',
        status: 'activo',
        leadership: 'coach',
        gameRoles: ['Flex'],
        createdAt: new Date(),
      }, { merge: true });

      await setDoc(doc(this.firestore, 'teams', teamId), {
        id: teamId,
        teamId,
        name: teamId,
        coachId: uid,
        coachName: name,
        createdAt: new Date(),
      }, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore direct setDoc note:', fsErr);
    }

    this.userSubject.next(userProfile);
    return userProfile;
  }

  // 2. Crear Jugador / Miembro en el equipo usando Firebase Auth + POST /api/auth/register-profile
  async createTeamMember(memberData: CreateTeamMemberInput): Promise<TeamMember> {
    const coachTeamId = this.currentUser?.teamId;
    if (!coachTeamId) throw new Error('No se encontró el equipo del coach actual.');

    // Crear el usuario en Firebase Auth en una app secundaria para NO desloguear al coach
    const tempAppName = `app-temp-${Date.now()}`;
    const tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        tempAuth,
        memberData.email.trim(),
        memberData.password
      );

      const uid = userCredential.user.uid;
      const name = memberData.name.trim();
      const role = memberData.role || 'player';

      // Consumir la API: POST /api/auth/register-profile con el payload exacto
      const payload = {
        uid,
        name,
        teamId: coachTeamId,
        role
      };

      try {
        await firstValueFrom(
          this.http.post(`${environment.apiUrl}/auth/register-profile`, payload)
        );
      } catch (apiErr) {
        console.warn('API register-profile warning:', apiErr);
      }

      // Guardar en Firestore directo con estado y liderazgo iniciales
      const initialLeadership: LeadershipRole = role === 'coach' ? 'coach' : 'miembro';
      try {
        await setDoc(doc(this.firestore, 'users', uid), {
          name,
          teamId: coachTeamId,
          role,
          status: 'activo',
          leadership: initialLeadership,
          gameRoles: [],
          agents: [],
          notes: '',
          createdAt: new Date()
        }, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore write warning:', fsErr);
      }

      return {
        userId: uid,
        name,
        role,
        teamId: coachTeamId,
        status: 'activo',
        leadership: initialLeadership,
        gameRoles: [],
        agents: [],
        notes: '',
        createdAt: new Date().toISOString()
      };
    } finally {
      await signOut(tempAuth);
      await deleteApp(tempApp);
    }
  }

  // 3. Obtener lista de miembros del equipo con roles de juego, liderazgo y estado
  async getTeamMembers(): Promise<TeamMember[]> {
    const currentTeam = this.currentUser?.teamId;
    if (!currentTeam) return [];

    // Consultar Firestore
    try {
      const q = query(
        collection(this.firestore, 'users'),
        where('teamId', '==', currentTeam)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => {
          const data = d.data();
          const userRole = (data['role'] || 'player') as UserRole;
          return {
            userId: d.id,
            name: data['name'] || 'Sin nombre',
            role: userRole,
            teamId: data['teamId'] || currentTeam,
            status: (data['status'] || 'activo') as MemberStatus,
            leadership: (data['leadership'] || (userRole === 'coach' ? 'coach' : 'miembro')) as LeadershipRole,
            gameRoles: (data['gameRoles'] || []) as GameRole[],
            agents: (data['agents'] || []) as string[],
            notes: data['notes'] || '',
            createdAt: data['createdAt']?.toDate?.()?.toISOString() || data['createdAt'] || null
          };
        });
      }
    } catch (e) {
      console.warn('Firestore query users error, checking backend:', e);
    }

    // Fallback vía backend
    try {
      const members = await firstValueFrom(
        this.http.get<TeamMember[]>(`${environment.apiUrl}/team/members`)
      );
      return members.map((m) => ({
        ...m,
        status: m.status || 'activo',
        leadership: m.leadership || (m.role === 'coach' ? 'coach' : 'miembro'),
        gameRoles: m.gameRoles || [],
        agents: m.agents || [],
        notes: m.notes || ''
      }));
    } catch {
      return [];
    }
  }

  // 4. Actualizar ficha táctica / estado del miembro (rol activo/desactivado, liderazgo, roles del juego, notas)
  async updateTeamMember(userId: string, data: UpdateMemberInput): Promise<void> {
    // 1. Guardar en Firestore directamente
    try {
      await setDoc(doc(this.firestore, 'users', userId), {
        ...data,
        updatedAt: new Date()
      }, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore updateDoc note:', fsErr);
    }

    // 2. Intentar llamar al backend si el endpoint existe
    try {
      await firstValueFrom(
        this.http.put(`${environment.apiUrl}/team/members/${userId}`, data)
      );
    } catch (e) {
      // Ignorar si el endpoint en backend aún no está listo
      console.log('Backend team-member update status:', e);
    }
  }

  // 5. Eliminar miembro del equipo
  async deleteTeamMember(userId: string): Promise<any> {
    try {
      await deleteDoc(doc(this.firestore, 'users', userId));
    } catch (e) {
      console.warn('Firestore deleteDoc note:', e);
    }

    try {
      await firstValueFrom(
        this.http.delete(`${environment.apiUrl}/auth/team-members/${userId}`)
      );
    } catch {
      // Ignorar si no existe endpoint delete en backend
    }

    return { message: 'Miembro eliminado' };
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.userSubject.next(null);
  }

  async getToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  }

  private async loadProfile(user: User | null): Promise<void> {
    if (!user) {
      this.userSubject.next(null);
      return;
    }
    try {
      const profile = await this.readProfile(user);
      this.userSubject.next(profile);
    } catch (error) {
      console.warn('Error loading user profile:', error);
      this.userSubject.next(null);
    }
  }

  private async readProfile(user: User): Promise<TeamUser> {
    // 1. Consultar backend /api/auth/me usando token Bearer
    const token = await user.getIdToken();
    if (token) {
      try {
        const me = await firstValueFrom(
          this.http.get<TeamUser>(`${environment.apiUrl}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        );
        if (me?.teamId && me?.role && me?.name) {
          return {
            userId: user.uid,
            teamId: me.teamId,
            role: me.role,
            name: me.name
          };
        }
      } catch (e) {
        console.warn('Backend /auth/me call error:', e);
      }
    }

    // 2. Fallback a Firestore cliente
    try {
      const snapshot = await getDoc(doc(this.firestore, 'users', user.uid));
      if (snapshot.exists()) {
        const data = snapshot.data() as Omit<TeamUser, 'userId'>;
        if (data.teamId && data.role && data.name) {
          return {
            userId: user.uid,
            teamId: data.teamId,
            role: data.role,
            name: data.name,
          };
        }
      }
    } catch (firestoreErr) {
      console.warn('Firestore client read permission:', firestoreErr);
    }

    throw new Error('La cuenta no tiene asignado un equipo o rol válido.');
  }

  private getApp(config: FirebaseOptions): FirebaseApp {
    return getApps().length ? getApp() : initializeApp(config);
  }
}
