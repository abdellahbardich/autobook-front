import type { Routes } from "@angular/router"
import { authGuard } from "./core/guards/auth.guard"

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./features/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "auth",
    loadChildren: () => import("./features/auth/auth.routes").then((m) => m.AUTH_ROUTES),
  },
  {
    path: "dashboard",
    canActivate: [authGuard],
    loadChildren: () => import("./features/dashboard/dashboard.routes").then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: "books",
    canActivate: [authGuard],
    loadChildren: () => import("./features/books/books.routes").then((m) => m.BOOKS_ROUTES),
  },
  {
    path: "profile",
    canActivate: [authGuard],
    loadComponent: () => import("./features/profile/profile.component").then((m) => m.ProfileComponent),
  },
  {
    path: "**",
    loadComponent: () => import("./features/not-found/not-found.component").then((m) => m.NotFoundComponent),
  },
]

