import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'schedule',
    canActivate: [authGuard],
    loadComponent: () => import('./schedule/schedule.page').then((m) => m.SchedulePage),
  },
  {
    path: 'coach-notes',
    canActivate: [authGuard],
    loadComponent: () => import('./coach-notes/coach-notes.page').then((m) => m.CoachNotesPage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
