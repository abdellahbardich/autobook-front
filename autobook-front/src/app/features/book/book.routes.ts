import { Routes } from '@angular/router';
import { BookDetailComponent } from './book-detail/book-detail.component';

export const BOOK_ROUTES: Routes = [
  { path: ':id', component: BookDetailComponent }
];