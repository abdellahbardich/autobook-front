import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError, of, tap } from "rxjs";
import { environment } from "../../../../environments/environment";
import { BookConversation, BookMessage, ConversationCreateRequest } from "../../../shared/models/book.model";
import { ToastService } from "../../../shared/services/toast.service";

@Injectable({
  providedIn: "root",
})
export class ConversationService {
  private readonly API_URL = `${environment.apiUrl}/conversations`;
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  // State management with signals
  private activeConversation = signal<BookConversation | null>(null);
  private conversations = signal<BookConversation[]>([]);

  // Getters for the state
  getActiveConversation() {
    return this.activeConversation();
  }

  getAllConversations() {
    return this.conversations();
  }

  // Set active conversation
  setActiveConversation(conversation: BookConversation | null) {
    this.activeConversation.set(conversation);
  }

  // Get all conversations
  getConversations(): Observable<BookConversation[]> {
    return this.http.get<BookConversation[]>(this.API_URL).pipe(
      tap((conversations) => {
        this.conversations.set(conversations);
      }),
      catchError((error) => {
        this.toastService.show("Failed to load conversations", "error");
        return of([]);
      }),
    );
  }

  // Get a specific conversation
  getConversation(id: number): Observable<BookConversation> {
    return this.http.get<BookConversation>(`${this.API_URL}/${id}`).pipe(
      tap((conversation) => {
        this.activeConversation.set(conversation);
      }),
      catchError((error) => {
        this.toastService.show("Failed to load conversation", "error");
        throw error;
      }),
    );
  }

  // Create a new conversation
  createConversation(request: ConversationCreateRequest): Observable<BookConversation> {
    return this.http.post<BookConversation>(this.API_URL, request).pipe(
      tap((conversation) => {
        this.conversations.update((convs) => [...convs, conversation]);
        this.activeConversation.set(conversation);
        this.toastService.show("Conversation created successfully", "success");
      }),
      catchError((error) => {
        this.toastService.show("Failed to create conversation: " + (error.error?.message || "Unknown error"), "error");
        throw error;
      }),
    );
  }

  // Send a message in a conversation
  sendMessage(conversationId: number, content: string): Observable<BookMessage> {
    return this.http.post<BookMessage>(`${this.API_URL}/${conversationId}/messages`, { content }).pipe(
      tap((message) => {
        // Update the active conversation with the new message
        const currentConversation = this.activeConversation();
        if (currentConversation && currentConversation.id === conversationId) {
          this.activeConversation.update((conv) => {
            if (!conv) return conv;
            return {
              ...conv,
              messages: [...conv.messages, message],
            };
          });
        }
        this.toastService.show("Message sent", "success");
      }),
      catchError((error) => {
        this.toastService.show("Failed to send message: " + (error.error?.message || "Unknown error"), "error");
        throw error;
      }),
    );
  }

  // Generate a book from a conversation
  generateBookFromConversation(conversationId: number, request: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/${conversationId}/generate-book`, request).pipe(
      tap((response) => {
        this.toastService.show("Book generation started", "success");
      }),
      catchError((error) => {
        this.toastService.show("Failed to start book generation: " + (error.error?.message || "Unknown error"), "error");
        throw error;
      }),
    );
  }

  // Delete a conversation
  deleteConversation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.conversations.update((convs) => convs.filter((conv) => conv.id !== id));
        if (this.activeConversation()?.id === id) {
          this.activeConversation.set(null);
        }
        this.toastService.show("Conversation deleted successfully", "success");
      }),
      catchError((error) => {
        this.toastService.show("Failed to delete conversation: " + (error.error?.message || "Unknown error"), "error");
        throw error;
      }),
    );
  }
}