import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Google Calendar token response from backend
 */
export interface GoogleAuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

/**
 * Google Calendar event from backend
 */
export interface GoogleCalendarEvent {
  id: string;
  title: string;
  start: string; // ISO 8601 datetime
  end: string;
  description?: string;
  source: 'google';
}

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
  private readonly STORAGE_KEY_ACCESS_TOKEN = 'valoplant.google.accessToken';
  private readonly STORAGE_KEY_REFRESH_TOKEN = 'valoplant.google.refreshToken';
  private readonly STORAGE_KEY_EXPIRES_AT = 'valoplant.google.expiresAt';

  // Observable for authentication status
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Initiate Google OAuth login flow
   * Redirects user to Google consent screen
   */
  initiateGoogleLogin(): void {
    // Google OAuth configuration (these values should match your Google Cloud Console setup)
    const clientId = '189484050653-o22iu5eau2c0c2j81r1ctqihvttbtvme.apps.googleusercontent.com';
    const redirectUri = `${window.location.origin}/schedule`; // Callback URL
    const scope = 'https://www.googleapis.com/auth/calendar'; // Permission to access calendar
    const responseType = 'code';

    // Build Google OAuth authorization URL
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=consent`;

    // Redirect to Google login
    window.location.href = googleAuthUrl;
  }

  /**
   * Handle Google OAuth callback
   * Extract authorization code from URL and exchange it for tokens
   */
  handleGoogleCallback(code: string, teamId: string): Observable<GoogleAuthResponse> {
    return this.http
      .post<GoogleAuthResponse>('/api/google/auth/callback', { code, teamId })
      .pipe(
        tap((response) => {
          this.storeTokens(response);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  /**
   * Fetch Google Calendar events for a specific month
   */
  getGoogleCalendarEvents(teamId: string, yearMonth: string): Observable<GoogleCalendarEvent[]> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      throw new Error('Not authenticated with Google Calendar');
    }

    return this.http.get<GoogleCalendarEvent[]>('/api/google/calendar/events', {
      params: { teamId, month: yearMonth }
    });
  }

  /**
   * Create an event in Google Calendar
   */
  createGoogleCalendarEvent(
    teamId: string,
    event: {
      title: string;
      start: string;
      end: string;
      description?: string;
    }
  ): Observable<{ id: string; status: string }> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      throw new Error('Not authenticated with Google Calendar');
    }

    return this.http.post<{ id: string; status: string }>(
      '/api/google/calendar/events',
      {
        teamId,
        ...event
      }
    );
  }

  /**
   * Logout from Google Calendar
   */
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY_ACCESS_TOKEN);
    localStorage.removeItem(this.STORAGE_KEY_REFRESH_TOKEN);
    localStorage.removeItem(this.STORAGE_KEY_EXPIRES_AT);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Check if user is authenticated with valid token
   */
  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  // Private helper methods

  private storeTokens(response: GoogleAuthResponse): void {
    localStorage.setItem(this.STORAGE_KEY_ACCESS_TOKEN, response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem(this.STORAGE_KEY_REFRESH_TOKEN, response.refreshToken);
    }
    // Store expiration time (current time + expiresIn seconds)
    const expiresAt = new Date().getTime() + response.expiresIn * 1000;
    localStorage.setItem(this.STORAGE_KEY_EXPIRES_AT, expiresAt.toString());
  }

  private getAccessToken(): string | null {
    const token = localStorage.getItem(this.STORAGE_KEY_ACCESS_TOKEN);
    const expiresAt = localStorage.getItem(this.STORAGE_KEY_EXPIRES_AT);

    if (!token || !expiresAt) {
      return null;
    }

    // Check if token is expired
    if (new Date().getTime() > parseInt(expiresAt)) {
      return null;
    }

    return token;
  }

  private hasValidToken(): boolean {
    return this.getAccessToken() !== null;
  }
}
