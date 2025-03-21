import type { Routes } from "@angular/router"



export const BOOKS_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () => import("./book-list/book-list.component").then((m) => m.BookListComponent),
  },
  {
    path: "new",
    loadComponent: () => import("./book-create/book-create.component").then((m) => m.BookCreateComponent),
  },
  {
    path: ":id",
    loadComponent: () => import("./book-detail/book-detail.component").then((m) => m.BookDetailComponent),
  },
  {
    path: ":id/edit",
    loadComponent: () => import("./book-edit/book-edit.component").then((m) => m.BookEditComponent),
  },
  {
    path: ":id/conversation",
    loadComponent: () =>
      import("./book-conversation/book-conversation.component").then((m) => m.BookConversationComponent),
  },
  {
    path: "collections",
    loadComponent: () => import("./collections/collections.component").then((m) => m.CollectionsComponent),
  },
  {
    path: "conversations",
    loadComponent: () => import("./conversations/conversations.component").then((m) => m.ConversationsComponent),
  },
  {
    path: "conversations/:id",
    loadComponent: () =>
      import("./conversations/conversation-detail/conversation-detail.component").then(
        (m) => m.ConversationDetailComponent,
      ),
  },
  {
    path: "conversations/new",
    loadComponent: () =>
      import("./conversations/conversation-new/conversation-new.component").then((m) => m.ConversationNewComponent),
  },
]
