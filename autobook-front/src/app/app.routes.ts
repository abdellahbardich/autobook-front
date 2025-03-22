import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { inject } from '@angular/core';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  { 
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  { 
    path: 'conversations',
    loadChildren: () => import('./features/conversation/conversation.routes').then(m => m.CONVERSATION_ROUTES),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  { 
    path: 'books',
    loadChildren: () => import('./features/book/book.routes').then(m => m.BOOK_ROUTES),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  { 
    path: 'collections',
    loadChildren: () => import('./features/collection/collection.routes').then(m => m.COLLECTION_ROUTES),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  { path: '', redirectTo: '/conversations', pathMatch: 'full' },
  { path: '**', redirectTo: '/conversations' }
];