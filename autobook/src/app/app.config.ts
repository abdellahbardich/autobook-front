import { type ApplicationConfig, isDevMode } from "@angular/core"
import { provideRouter, withComponentInputBinding } from "@angular/router"
import { routes } from "./app.routes"
import { provideHttpClient, withInterceptors } from "@angular/common/http"
import { provideAnimations } from "@angular/platform-browser/animations"
import { provideStore } from "@ngrx/store"
import { provideEffects } from "@ngrx/effects"
import { provideStoreDevtools } from "@ngrx/store-devtools"
import { authInterceptor } from "./core/interceptors/auth.interceptor"

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideStore(),
    provideEffects(),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
}

