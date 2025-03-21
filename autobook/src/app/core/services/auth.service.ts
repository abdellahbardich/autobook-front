import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, catchError, map, of, tap } from "rxjs";
import { environment } from "../../../environments/environment";
import { User } from "../../shared/models/user.model";
import { AuthResponse, LoginRequest, RegisterRequest } from "../../shared/models/auth.model";
import { ToastService } from "../../shared/services/toast.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = "auth_token";
  private readonly REFRESH_TOKEN_KEY = "refresh_token";
  private readonly TOKEN_TYPE_KEY = "auth_token_type";

  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  // Angular signals for modern state management
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

  login(usernameOrEmail: string, password: string): Observable<AuthResponse> {
    const loginRequest: LoginRequest = { usernameOrEmail, password };
    
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, loginRequest).pipe(
      tap((response) => {
        this.setToken(response.token);
        this.setTokenType(response.tokenType || "Bearer");
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }
        this.userSubject.next(response.user);
        this.isAuthenticated.set(true);
        this.currentUser.set(response.user);
        this.toastService.show("Login successful", "success");
      }),
      catchError((error) => {
        this.toastService.show("Login failed: " + (error.error?.message || "Unknown error"), "error");
        throw error;
      })
    );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/register`, userData).pipe(
      tap(() => {
        this.toastService.show("Registration successful. Please log in.", "success");
      }),
      catchError((error) => {
        this.toastService.show("Registration failed: " + (error.error?.message || "Unknown error"), "error");
        throw error;
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_TYPE_KEY);
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
        this.setTokenType(response.tokenType || "Bearer");
      })
    );
  }
  
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }
  
  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  private setTokenType(tokenType: string): void {
    localStorage.setItem(this.TOKEN_TYPE_KEY, tokenType);
  }

  getTokenType(): string {
    return localStorage.getItem(this.TOKEN_TYPE_KEY) || "Bearer";
  }

  // For interceptors: returns the full Authorization header value
  getAuthorizationHeader(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const tokenType = this.getTokenType();
    return `${tokenType} ${token}`;
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/user/profile`).pipe(
      tap((user) => {
        this.userSubject.next(user);
        this.currentUser.set(user);
      }),
      catchError((error) => {
        this.toastService.show("Failed to load profile: " + (error.error?.message || "Unknown error"), "error");
        throw error;
      })
    );
  }
}