import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NoteImageService {
  constructor(private readonly http: HttpClient) {}

  async upload(file: File, teamId: string): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await firstValueFrom(
      this.http.post<{ imageUrl: string }>(`${environment.apiUrl}/notes/upload`, formData)
    );

    return response.imageUrl;
  }
}
