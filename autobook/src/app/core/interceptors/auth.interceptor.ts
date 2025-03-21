import type { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, switchMap, throwError, Observable } from "rxjs";
import { AuthService } from "../services/auth.service";

// Flag to prevent recursive refresh attempts
let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip adding token for auth endpoints, including the refresh token endpoint
  if (
    req.url.includes("/auth/login") || 
    req.url.includes("/auth/register") ||
    req.url.includes("/auth/refresh-token")
  ) {
    return next(req);
  }

  const authHeader = authService.getAuthorizationHeader();
  if (authHeader) {
    const authReq = req.clone({
      headers: req.headers.set("Authorization", authHeader),
    });

    return next(authReq).pipe(
      catchError((error) => {
        // If 401 Unauthorized and not already refreshing token, try to refresh token
        if (error.status === 401 && !isRefreshing) {
          isRefreshing = true;
          
          return authService.refreshToken().pipe(
            switchMap(() => {
              isRefreshing = false;
              const newAuthHeader = authService.getAuthorizationHeader();
              const newAuthReq = req.clone({
                headers: req.headers.set("Authorization", newAuthHeader || ""),
              });
              
              return next(newAuthReq);
            }),
            catchError((refreshError) => {
              // If refresh token fails, logout user and reset refreshing flag
              isRefreshing = false;
              authService.logout();
              return throwError(() => refreshError);
            }),
          );
        }
        
        // For other errors or if already refreshing, just pass through
        return throwError(() => error);
      }),
    );
  }

  return next(req);
};