import { inject } from "@angular/core"
import { type CanActivateFn, Router } from "@angular/router"
import { map, take } from "rxjs"
import { AuthService } from "../services/auth.service"

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService)
  const router = inject(Router)

  return authService.user$.pipe(
    take(1),
    map((user) => {
      const isAuthenticated = !!user
      if (!isAuthenticated) {
        router.navigate(["/auth/login"], { queryParams: { returnUrl: state.url } })
        return false
      }
      return true
    }),
  )
}

