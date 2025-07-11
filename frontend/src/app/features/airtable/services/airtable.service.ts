import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import {
  IAirtableAuthResponse,
  IUserAuth,
} from '../models/airtable.model';
import { Router } from '@angular/router';
import { getFromLS, LSKeys, removeFromLS, setToLS } from '../utils/storage';

@Injectable({ providedIn: 'root' })
export class AirtableService {
  private API_BASE = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  // -----------------------------
  // OAuth Authentication Methods
  // -----------------------------

  initiateAirtableLogin(): void {
    window.location.href = `${this.API_BASE}/auth/airtable`;
  }

  getAuthStatus(): Observable<IUserAuth> {
    return this.http
      .get<IAirtableAuthResponse>(`${this.API_BASE}/auth/airtable/auth-status`, {
        withCredentials: true,
      })
      .pipe(
        map((res) => {
          const user: IUserAuth = {
            isConnected: res.isConnected,
            email: res.email,
            connectedAt: new Date(res.connectedAt),
            isLoading: false,
            errorMessage: '',
          };
          setToLS(LSKeys.USER, user);
          return user;
        }),
        catchError((err) => {
          const fallback: IUserAuth = {
            isConnected: false,
            isLoading: false,
            email: '',
            connectedAt: null,
            errorMessage: '',
          };
          setToLS(LSKeys.USER, fallback);
          return of(fallback);
        }),
      );
  }

  disconnectAirtable(): Observable<any> {
    return this.http.delete(`${this.API_BASE}/auth/airtable/logout`, {
      withCredentials: true,
    });
  }

  isLoggedIn(): boolean {
    const authData = getFromLS<IUserAuth>(LSKeys.USER);
    if (!authData) return false;
    return authData.isConnected === true;
  }

  removeUser(): void {
    removeFromLS(LSKeys.USER);
    this.router.navigate(['/airtable']);
  }

  // -----------------------------
  // Scraping / MFA Methods
  // -----------------------------

  startScraping(): Observable<any> {
    return this.http.post(`${this.API_BASE}/api/scraper/start-login`, {}, {
      withCredentials: true
    });
  }

  verifyMfaCode(mfaCode: string): Observable<any> {
    return this.http.post(`${this.API_BASE}/api/scraper/submit-mfa`, { mfaCode },
      {
        withCredentials: true
      }
    );
  }

  performScraping(): Observable<any> {
    return this.http.get(`${this.API_BASE}/api/scraper/scrape`, {
      withCredentials: true
    })
  }
}
