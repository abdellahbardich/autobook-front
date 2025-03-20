import type { HttpInterceptorFn } from "@angular/common/http"
import { inject } from "@angular/core"
import { catchError, switchMap, throwError } from "rxjs"
import { AuthService } from "../services/auth.service"

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)

  // Skip adding token for auth endpoints
  if (req.url.includes("/auth/login") || req.url.includes("/auth/register")) {
    return next(req)
  }

  const token = authService.getToken()
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set("Authorization", `Bearer ${token}`),
    })

    return next(authReq).pipe(
      catchError((error) => {
        // If 401 Unauthorized, try to refresh token
        if (error.status === 401) {
          return authService.refreshToken().pipe(
            switchMap(() => {
              const newToken = authService.getToken()
              const newAuthReq = req.clone({
                headers: req.headers.set("Authorization", `Bearer ${newToken}`),
              })
              return next(newAuthReq)
            }),
            catchError((refreshError) => {
              // If refresh token fails, logout user
              authService.logout()
              return throwError(() => refreshError)
            }),
          )
        }
        return throwError(() => error)
      }),
    )
  }

  return next(req)
}

