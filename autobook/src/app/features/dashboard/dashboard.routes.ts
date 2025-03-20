import type { Routes } from "@angular/router"

export const DASHBOARD_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () => import("./dashboard/dashboard.component").then((m) => m.DashboardComponent),
  },
]

