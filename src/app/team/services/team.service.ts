import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TeamMember {
  userId: string;
  name: string;
  email: string;
  role: string;
  status: string;
  gameRoles: string[];
  teamRole: string;
  createdAt: string;
}

export interface TeamMemberUpdate {
  status?: string;
  teamRole?: string;
  gameRoles?: string[];
}

@Injectable({ providedIn: 'root' })
export class TeamService {
  private apiUrl = `${environment.apiUrl}/team`;

  constructor(private readonly http: HttpClient) {}

  getMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.apiUrl}/members`);
  }

  updateMember(userId: string, data: TeamMemberUpdate): Observable<{ message: string; updates: any }> {
    return this.http.put<{ message: string; updates: any }>(`${this.apiUrl}/members/${userId}`, data);
  }
}
