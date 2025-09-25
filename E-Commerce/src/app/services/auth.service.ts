import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { RegisterRequest } from '../models/register-request';
import { LoginRequest } from '../models/login-request';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://localhost:7250/api/User';
  private logoutTimerId: any;
  private logoutCheckInterval: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  register(payload: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, payload);
  }

  login(payload: LoginRequest): Observable<any> {
    return this.http.post<{ token: string, user: any }>(`${this.baseUrl}/login`, payload)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.startLogoutTimer(response.token);
        })
      );


  }

  getUserId(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded?.id || null;  // << this is the correct field
    } catch (error) {
      console.error('Invalid token', error);
      return null;
    }
  }


  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (this.logoutTimerId) {
      clearTimeout(this.logoutTimerId);
    }
    this.router.navigate(['/login']);
  }


  private startLogoutTimer(token: string) {
    if (this.logoutCheckInterval) {
      clearInterval(this.logoutCheckInterval);
    }

    this.logoutCheckInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        clearInterval(this.logoutCheckInterval);
        return;
      }

      try {
        const decoded: any = jwtDecode(token);
        const exp = decoded.exp * 1000; // convert to ms
        if (Date.now() >= exp) {
          clearInterval(this.logoutCheckInterval);
          this.logout();
          this.snackBar.open('Session expired. You have been logged out.', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      } catch (error) {
        console.error('Invalid token', error);
        this.logout();
        clearInterval(this.logoutCheckInterval);
      }
    }, 1000); // check every 1 second
  }

}
