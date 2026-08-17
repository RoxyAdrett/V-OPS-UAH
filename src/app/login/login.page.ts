import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { keyOutline, logInOutline, personAddOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { AuthService, DEFAULT_COACH_SECRET } from '../core/services/auth.service';
import { UserRole } from '../coach-notes/models/coach-note.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonContent,
    IonInput,
    IonItem,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonIcon,
    IonSpinner
  ]
})
export class LoginPage implements OnInit {
  mode: 'login' | 'register' = 'login';
  role: UserRole = 'coach';

  // Campos de formulario
  name = '';
  teamId = 'team-1';
  email = localStorage.getItem('valoplant.last-email') ?? '';
  password = '';
  coachSecretKey = '';

  error = '';
  success = '';
  loading = false;
  returnUrl = '/home';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    addIcons({ logInOutline, personAddOutline, shieldCheckmarkOutline, keyOutline });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    if (this.authService.isAuthenticated) {
      void this.router.navigateByUrl(this.returnUrl);
    }
  }

  async onSubmit(): Promise<void> {
    this.error = '';
    this.success = '';
    this.loading = true;

    try {
      if (this.mode === 'login') {
        await this.authService.login({
          email: this.email.trim(),
          password: this.password,
          role: this.role
        });
        localStorage.setItem('valoplant.last-email', this.email.trim());
        await this.router.navigateByUrl(this.returnUrl);
      } else {
        if (!this.name.trim()) {
          throw new Error('Por favor ingresa tu nombre de Coach.');
        }
        if (!this.teamId.trim()) {
          throw new Error('Por favor ingresa el identificador de tu equipo (Team ID).');
        }
        if (!this.coachSecretKey.trim()) {
          throw new Error('Debes ingresar la Clave Secreta de Coach.');
        }
        if (this.coachSecretKey.trim() !== DEFAULT_COACH_SECRET) {
          throw new Error('Clave Secreta de Coach incorrecta. Solo los coaches autorizados pueden crear cuentas.');
        }

        await this.authService.registerCoach({
          email: this.email.trim(),
          password: this.password,
          name: this.name.trim(),
          teamId: this.teamId.trim().toLowerCase(),
          role: 'coach',
          coachSecretKey: this.coachSecretKey.trim()
        });

        localStorage.setItem('valoplant.last-email', this.email.trim());
        this.success = '¡Cuenta de Coach y Equipo creados con éxito! Ingresando...';
        setTimeout(() => {
          void this.router.navigateByUrl(this.returnUrl);
        }, 800);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        this.error = 'Correo o contraseña incorrectos.';
      } else if (err?.code === 'auth/email-already-in-use') {
        this.error = 'Este correo ya está registrado. Intenta iniciar sesión.';
      } else if (err?.code === 'auth/weak-password') {
        this.error = 'La contraseña debe tener al menos 6 caracteres.';
      } else {
        this.error = err?.message || 'Ocurrió un error al procesar la solicitud.';
      }
    } finally {
      this.loading = false;
    }
  }

  setDemoCoach(): void {
    this.email = 'coach_prueba@valoplant.com';
    this.password = 'password1234';
    this.role = 'coach';
    this.mode = 'login';
  }
}
