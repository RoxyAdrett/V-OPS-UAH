import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo interceptar peticiones hacia nuestra API
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  // Si ya tiene header de Authorization, continuar
  if (req.headers.has('Authorization')) {
    return next(req);
  }

  const authService = inject(AuthService);

  return from(authService.getToken()).pipe(
    switchMap((token) => {
      if (token) {
        const clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        return next(clonedRequest);
      }
      return next(req);
    })
  );
};
