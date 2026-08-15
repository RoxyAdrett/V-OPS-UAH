import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
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
import { Firestore, doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { firebaseConfig } from '../../../environments/firebase.config';
import { environment } from '../../../environments/environment';
import { TeamUser, UserRole } from '../../coach-notes/models/coach-note.model';

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
          : 'Esta cuenta no tiene rol de jugador.'
      );
    }

    this.userSubject.next(profile);
    return profile;
  }

  async register(data: RegisterCredentials): Promise<TeamUser> {
    if (!firebaseConfig.apiKey) {
      throw new Error('Configura Firebase en src/environments/firebase.config.ts.');
    }

    const credential = await createUserWithEmailAndPassword(
      this.auth,
      data.email,
      data.password
    );

    const userProfile: TeamUser = {
      userId: credential.user.uid,
      name: data.name.trim(),
      teamId: data.teamId.trim().toLowerCase(),
      role: data.role,
    };

    // Registrar perfil en backend o Firestore
    try {
      await this.http.post(`${environment.apiUrl}/auth/register-profile`, {
        uid: userProfile.userId,
        name: userProfile.name,
        teamId: userProfile.teamId,
        role: userProfile.role
      }).toPromise();
    } catch {
      // Fallback directo a Firestore si el backend no estuviese disponible
      await setDoc(doc(this.firestore, 'users', userProfile.userId), {
        name: userProfile.name,
        teamId: userProfile.teamId,
        role: userProfile.role,
        createdAt: new Date(),
      });
    }

    this.userSubject.next(userProfile);
    return userProfile;
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
    // Intentar leer primero vía Firestore
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

    // Fallback: consultar el backend /api/auth/me con el token
    const token = await user.getIdToken();
    if (token) {
      const me = await firstValueFrom(
        this.http.get<TeamUser>(`${environment.apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );
      if (me?.teamId && me?.role) {
        return me;
      }
    }

    throw new Error('La cuenta no tiene asignado un equipo o rol válido.');
  }

  private getApp(config: FirebaseOptions): FirebaseApp {
    return getApps().length ? getApp() : initializeApp(config);
  }
}
