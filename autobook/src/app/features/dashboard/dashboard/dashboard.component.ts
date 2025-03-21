import { Component, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"
import { BookService } from "../../books/services/book.service"
import { ConversationService } from "../../books/services/conversation.service"
import type { Book } from "../../../shared/models/book.model"
import { BookCardComponent } from "../../books/components/book-card/book-card.component"

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink, BookCardComponent],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <div class="header-actions">
          <a routerLink="/books/conversations/new" class="btn-create">New Conversation</a>
          <a routerLink="/books/new" class="btn-create secondary">Create Book Directly</a>
        </div>
      </div>
      
      <div class="dashboard-grid">
        <div class="dashboard-main">
          <div class="dashboard-stats">
            <div class="stat-card">
              <div class="stat-value">{{ totalBooks }}</div>
              <div class="stat-label">Total Books</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-value">{{ inProgressBooks }}</div>
              <div class="stat-label">In Progress</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-value">{{ completedBooks }}</div>
              <div class="stat-label">Completed</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-value">{{ conversations.length }}</div>
              <div class="stat-label">Conversations</div>
            </div>
          </div>
          
          @if (isLoading) {
            <div class="loading">
              <p>Loading your dashboard...</p>
            </div>
          } @else {
            @if (recentBooks.length > 0) {
              <div class="recent-books">
                <div class="section-header">
                  <h2>Recent Books</h2>
                  <a routerLink="/books" class="view-all">View All</a>
                </div>
                <div class="book-grid">
                  @for (book of recentBooks; track book.id) {
                    <app-book-card [book]="book" (deleted)="onBookDeleted($event)"></app-book-card>
                  }
                </div>
              </div>
            }
            
            @if (generatingBooks.length > 0) {
              <div class="generating-books">
                <div class="section-header">
                  <h2>Currently Generating</h2>
                </div>
                <div class="book-grid">
                  @for (book of generatingBooks; track book.id) {
                    <app-book-card [book]="book" (deleted)="onBookDeleted($event)"></app-book-card>
                  }
                </div>
              </div>
            }
          }
        </div>
        
        <div class="dashboard-sidebar">
          <div class="sidebar-section">
            <div class="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div class="action-buttons">
              <a routerLink="/books/conversations/new" class="action-button">
                <span class="action-icon">💬</span>
                <span class="action-text">New Conversation</span>
              </a>
              <a routerLink="/books/new" class="action-button">
                <span class="action-icon">📚</span>
                <span class="action-text">Create Book</span>
              </a>
              <a routerLink="/books/collections" class="action-button">
                <span class="action-icon">📁</span>
                <span class="action-text">Manage Collections</span>
              </a>
              <a routerLink="/books/conversations" class="action-button">
                <span class="action-icon">💬</span>
                <span class="action-text">View Conversations</span>
              </a>
            </div>
          </div>
          
          <div class="sidebar-section">
            <div class="section-header">
              <h2>Recent Conversations</h2>
              <a routerLink="/books/conversations" class="view-all">View All</a>
            </div>
            @if (conversations.length === 0) {
              <div class="empty-list">
                <p>No conversations yet</p>
                <a routerLink="/books/conversations/new" class="btn-small">Start One</a>
              </div>
            } @else {
              <ul class="conversation-list">
                @for (conversation of conversations.slice(0, 5); track conversation.id) {
                  <li class="conversation-item">
                    <a [routerLink]="['/books/conversations', conversation.id]" class="conversation-link">
                      <span class="conversation-title">{{ conversation.title || 'Untitled Conversation' }}</span>
                      <span class="conversation-date">{{ conversation.updatedAt | date:'shortDate' }}</span>
                    </a>
                  </li>
                }
              </ul>
            }
          </div>
          
          <div class="sidebar-section">
            <div class="section-header">
              <h2>Collections</h2>
              <a routerLink="/books/collections" class="view-all">View All</a>
            </div>
            @if (collections.length === 0) {
              <div class="empty-list">
                <p>No collections yet</p>
                <a routerLink="/books/collections" class="btn-small">Create One</a>
              </div>
            } @else {
              <ul class="collection-list">
                @for (collection of collections.slice(0, 5); track collection.id) {
                  <li class="collection-item">
                    <a routerLink="/books/collections" class="collection-link">
                      <span class="collection-title">{{ collection.name }}</span>
                      <span class="collection-count">{{ collection.books.length }} books</span>
                    </a>
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .header-actions {
      display: flex;
      gap: 1rem;
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
    
    .btn-create.secondary {
      background-color: #ecf0f1;
      color: #7f8c8d;
    }
    
    .btn-create.secondary:hover {
      background-color: #bdc3c7;
    }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 2rem;
    }
    
    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      text-align: center;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    }
    
    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #3498db;
      margin-bottom: 0.5rem;
    }
    
    .stat-label {
      color: #7f8c8d;
      font-size: 1rem;
    }
    
    .loading {
      text-align: center;
      padding: 3rem;
      background-color: #f8f9fa;
      border-radius: 8px;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    h2 {
      font-size: 1.5rem;
      color: #2c3e50;
      margin: 0;
    }
    
    .view-all {
      color: #3498db;
      text-decoration: none;
      font-size: 0.9rem;
    }
    
    .view-all:hover {
      text-decoration: underline;
    }
    
    .recent-books, .generating-books {
      margin-bottom: 2rem;
    }
    
    .book-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    
    .dashboard-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .sidebar-section {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
    }
    
    .action-buttons {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
    
    .action-button {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background-color: #f8f9fa;
      border-radius: 4px;
      text-decoration: none;
      color: #2c3e50;
      transition: background-color 0.3s;
    }
    
    .action-button:hover {
      background-color: #e9ecef;
    }
    
    .action-icon {
      font-size: 1.5rem;
    }
    
    .empty-list {
      text-align: center;
      padding: 1rem;
      color: #7f8c8d;
    }
    
    .btn-small {
      display: inline-block;
      background-color: #3498db;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      text-decoration: none;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }
    
    .conversation-list, .collection-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .conversation-item, .collection-item {
      margin-bottom: 0.5rem;
    }
    
    .conversation-link, .collection-link {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background-color: #f8f9fa;
      border-radius: 4px;
      text-decoration: none;
      transition: background-color 0.3s;
    }
    
    .conversation-link:hover, .collection-link:hover {
      background-color: #e9ecef;
    }
    
    .conversation-title, .collection-title {
      color: #2c3e50;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .conversation-date, .collection-count {
      font-size: 0.8rem;
      color: #7f8c8d;
    }
    
    @media (max-width: 992px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
      
      .dashboard-sidebar {
        order: -1;
        margin-bottom: 2rem;
      }
    }
    
    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .header-actions {
        width: 100%;
      }
      
      .btn-create {
        flex: 1;
        text-align: center;
      }
      
      .book-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      }
    }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private bookService = inject(BookService)
  private conversationService = inject(ConversationService)

  books: Book[] = []
  conversations: any[] = []
  collections: any[] = []
  isLoading = true

  get totalBooks(): number {
    return this.books.length
  }

  get inProgressBooks(): number {
    return this.books.filter((book) => book.status === "generating").length
  }

  get completedBooks(): number {
    return this.books.filter((book) => book.status === "completed").length
  }

  get recentBooks(): Book[] {
    return this.books.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3)
  }

  get generatingBooks(): Book[] {
    return this.books.filter((book) => book.status === "generating")
  }

  ngOnInit(): void {
    this.loadData()
  }

  loadData(): void {
    this.isLoading = true

    // Load books
    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books = books
        this.isLoading = false
      },
      error: () => {
        this.isLoading = false
      },
    })

    // Load conversations
    this.conversationService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations
      },
    })

    // Load collections
    this.bookService.getCollections().subscribe({
      next: (collections) => {
        this.collections = collections
      },
    })
  }

  onBookDeleted(bookId: string): void {
    this.books = this.books.filter((book) => book.id !== bookId)
  }
}

