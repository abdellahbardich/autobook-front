import { Routes } from '@angular/router';
import { ConversationListComponent } from './conversation-list/conversation-list.component';
import { ConversationDetailComponent } from './conversation-detail/conversation-detail.component';

export const CONVERSATION_ROUTES: Routes = [
  { path: '', component: ConversationListComponent },
  { path: ':id', component: ConversationDetailComponent }
];