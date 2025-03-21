// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { AuthGuard } from './core/guards/auth.guard';

// const routes: Routes = [
//   { 
//     path: 'auth',
//     loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
//   },
//   { 
//     path: 'conversations',
//     loadChildren: () => import('./features/conversation/conversation.module').then(m => m.ConversationModule),
//     canActivate: [AuthGuard]
//   },
//   { 
//     path: 'books',
//     loadChildren: () => import('./features/book/book.module').then(m => m.BookModule),
//     canActivate: [AuthGuard]
//   },
//   { 
//     path: 'collections',
//     loadChildren: () => import('./features/collection/collection.module').then(m => m.CollectionModule),
//     canActivate: [AuthGuard]
//   },
//   { path: '', redirectTo: '/conversations', pathMatch: 'full' },
//   { path: '**', redirectTo: '/conversations' }
// ];

// @NgModule({
//     imports: [RouterModule.forChild(routes)],
//     exports: [RouterModule]
// })
// export class AppRoutingModule { }