import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { BehaviorSubject, type Observable, catchError, map, of, tap } from "rxjs";
import { environment } from "../../../environments/environment";
import { User } from "../../shared/models/user.model";
import { ToastService } from "../../shared/services/toast.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  // Using relative URL so that Angular CLI proxy can intercept the request
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = "auth_token";
  private readonly REFRESH_TOKEN_KEY = "refresh_token";

  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  // Modern Angular signal for auth state
  public isAuthenticated = signal<boolean>(false);
  public currentUser = signal<User | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {}

  initAuth(): void {
    const token = this.getToken();
    if (token) {
      this.validateToken().subscribe();
    }
  }

  login(usernameOrEmail: string, password: string): Observable<any> {
    // Call using relative URL; proxy will forward /api/auth/login to backend
    return this.http.post<any>(`${this.API_URL}/login`, { usernameOrEmail, password }).pipe(
      tap((response) => {
        this.setToken(response.token);
        this.setRefreshToken(response.refreshToken);
        this.userSubject.next(response.user);
        this.isAuthenticated.set(true);
        this.currentUser.set(response.user);
        this.toastService.show("Login successful", "success");
      }),
      catchError((error) => {
        this.toastService.show("Login failed: " + error.error.message, "error");
        throw error;
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/register`, userData).pipe(
      tap(() => {
        this.toastService.show("Registration successful. Please log in.", "success");
      }),
      catchError((error) => {
        this.toastService.show("Registration failed: " + error.error.message, "error");
        throw error;
      })
    );
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
    this.userSubject.next(null);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(["/auth/login"]);
    this.toastService.show("You have been logged out", "info");
  }

  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      this.isAuthenticated.set(false);
      return of(false);
    }

    return this.http.get<User>(`${this.API_URL}/me`).pipe(
      map((user) => {
        this.userSubject.next(user);
        this.isAuthenticated.set(true);
        this.currentUser.set(user);
        return true;
      }),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<any>(`${this.API_URL}/refresh-token`, { refreshToken }).pipe(
      tap((response) => {
        this.setToken(response.token);
        this.setRefreshToken(response.refreshToken);
      })
    );
  }

  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private setToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private getRefreshToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  private setRefreshToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }
}
