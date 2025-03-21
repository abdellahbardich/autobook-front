import { Routes } from '@angular/router';
import { CollectionListComponent } from './collection-list/collection-list.component';
import { CollectionDetailComponent } from './collection-detail/collection-detail.component';

export const COLLECTION_ROUTES: Routes = [
  { path: '', component: CollectionListComponent },
  { path: ':id', component: CollectionDetailComponent }
];