import { Component, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"
import { ConversationService } from "../services/conversation.service"
import type { BookConversation } from "../../../shared/models/book.model"

@Component({
  selector: "app-conversations",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="conversations-container">
      <div class="conversations-header">
        <h1>Conversations</h1>
        <a routerLink="/books/conversations/new" class="btn-create">New Conversation</a>
      </div>
      
      @if (isLoading) {
        <div class="loading">
          <p>Loading conversations...</p>
        </div>
      } @else if (conversations.length === 0) {
        <div class="empty-state">
          <h2>No Conversations Yet</h2>
          <p>Start a new conversation to create a book with AI assistance</p>
          <a routerLink="/books/conversations/new" class="btn-primary">Start Your First Conversation</a>
        </div>
      } @else {
        <div class="conversations-grid">
          @for (conversation of conversations; track conversation.id) {
            <div class="conversation-card">
              <!-- <h2>{{ conversation.title || 'Untitled Conversation' }}</h2> -->
              <p class="conversation-preview">
                {{ getLastMessage(conversation) || 'No messages yet' }}
              </p>
              <div class="conversation-meta">
                <span>{{ conversation.messages.length }} messages</span>
                <span>{{ conversation.updatedAt | date:'medium' }}</span>
              </div>
              <div class="conversation-actions">
                <a [routerLink]="['/books/conversations', conversation.id]" class="btn-view">Continue</a>
                <button class="btn-delete" (click)="deleteConversation(conversation.id)">Delete</button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
    .conversations-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .conversations-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    h1 {
      font-size: 2rem;
      color: #2c3e50;
      margin: 0;
    }
    
    .btn-create {
      background-color: #3498db;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      transition: background-color 0.3s;
    }
    
    .btn-create:hover {
      background-color: #2980b9;
    }
    
    .loading, .empty-state {
      text-align: center;
      padding: 3rem;
      background-color: #f8f9fa;
      border-radius: 8px;
    }
    
    .empty-state h2 {
      font-size: 1.5rem;
      color: #2c3e50;
      margin-bottom: 1rem;
    }
    
    .empty-state p {
      color: #7f8c8d;
      margin-bottom: 2rem;
    }
    
    .btn-primary {
      background-color: #3498db;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      transition: background-color 0.3s;
    }
    
    .btn-primary:hover {
      background-color: #2980b9;
    }
    
    .conversations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .conversation-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .conversation-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    }
    
    .conversation-card h2 {
      font-size: 1.25rem;
      color: #2c3e50;
      margin: 0 0 0.5rem;
    }
    
    .conversation-preview {
      color: #7f8c8d;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      line-height: 1.4;
      height: 2.8rem;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .conversation-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: #95a5a6;
      margin-bottom: 1rem;
    }
    
    .conversation-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .conversation-actions a, .conversation-actions button {
      flex: 1;
      padding: 0.5rem;
      border-radius: 4px;
      text-align: center;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-view {
      background-color: #3498db;
      color: white;
      text-decoration: none;
    }
    
    .btn-view:hover {
      background-color: #2980b9;
    }
    
    .btn-delete {
      background-color: #e74c3c;
      color: white;
      border: none;
    }
    
    .btn-delete:hover {
      background-color: #c0392b;
    }
    
    @media (max-width: 768px) {
      .conversations-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }
    `,
  ],
})
export class ConversationsComponent implements OnInit {
  private conversationService = inject(ConversationService)

  conversations: BookConversation[] = []
  isLoading = true

  ngOnInit(): void {
    this.loadConversations()
  }

  loadConversations(): void {
    this.isLoading = true
    this.conversationService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations
        this.isLoading = false
      },
      error: () => {
        this.isLoading = false
      },
    })
  }

  getLastMessage(conversation: BookConversation): string {
    if (!conversation.messages || conversation.messages.length === 0) {
      return ""
    }

    const lastMessage = conversation.messages[conversation.messages.length - 1]
    return lastMessage.content
  }

  deleteConversation(id: string): void {
    if (confirm("Are you sure you want to delete this conversation?")) {
      this.conversationService.deleteConversation(id).subscribe({
        next: () => {
          this.conversations = this.conversations.filter((c) => c.id !== id)
        },
      })
    }
  }
}

