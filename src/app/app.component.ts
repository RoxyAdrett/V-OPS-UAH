import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonApp, IonIcon, IonRouterOutlet, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  chatboxOutline,
  imageOutline,
  logOutOutline,
  mapOutline,
  personCircleOutline,
  shieldOutline
} from 'ionicons/icons';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    CommonModule,
    IonApp,
    IonIcon,
    IonRouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
})
export class AppComponent {
  readonly user$ = this.authService.user$;

  constructor(
    public readonly authService: AuthService,
    private readonly router: Router,
    private readonly alertController: AlertController
  ) {
    addIcons({
      calendarOutline,
      chatboxOutline,
      imageOutline,
      logOutOutline,
      mapOutline,
      personCircleOutline,
      shieldOutline
    });
  }

  async confirmLogout(): Promise<void> {
    const alert = await this.alertController.create({
      header: '¿Cerrar sesión?',
      message: '¿Estás seguro de que deseas salir de tu cuenta?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Cerrar sesión',
          role: 'destructive',
          cssClass: 'alert-button-confirm',
          handler: () => {
            void this.executeLogout();
          },
        },
      ],
    });

    await alert.present();
  }

  private async executeLogout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/login');
  }
}
