import type { Routes } from "@angular/router"

export const AUTH_ROUTES: Routes = [
  {
    path: "login",
    loadComponent: () => import("./login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "register",
    loadComponent: () => import("./register/register.component").then((m) => m.RegisterComponent),
  },
  {
    path: "forgot-password",
    loadComponent: () => import("./forgot-password/forgot-password.component").then((m) => m.ForgotPasswordComponent),
  },
  {
    path: "profile",
    loadComponent: () => import("./login").then((m) => m.ForgotPasswordComponent),
  },

  {
    path: "reset-password",
    loadComponent: () => import("./reset-password/reset-password.component").then((m) => m.ResetPasswordComponent),
  },
]

