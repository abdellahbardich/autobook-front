import { Component, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"
import { BookService } from "../../books/services/book.service"
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
        <a routerLink="/books/new" class="btn-create">Create New Book</a>
      </div>
      
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
      </div>
      
      @if (isLoading) {
        <div class="loading">
          <p>Loading your dashboard...</p>
        </div>
      } @else {
        @if (recentBooks.length > 0) {
          <div class="recent-books">
            <h2>Recent Books</h2>
            <div class="book-grid">
              @for (book of recentBooks; track book.id) {
                <app-book-card [book]="book" (deleted)="onBookDeleted($event)"></app-book-card>
              }
            </div>
          </div>
        }
        
        @if (generatingBooks.length > 0) {
          <div class="generating-books">
            <h2>Currently Generating</h2>
            <div class="book-grid">
              @for (book of generatingBooks; track book.id) {
                <app-book-card [book]="book" (deleted)="onBookDeleted($event)"></app-book-card>
              }
            </div>
          </div>
        }
      }
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
    
    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
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
    
    .recent-books, .generating-books {
      margin-bottom: 3rem;
    }
    
    h2 {
      font-size: 1.5rem;
      color: #2c3e50;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #ecf0f1;
    }
    
    .book-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    
    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
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

  books: Book[] = []
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
    this.loadBooks()
  }

  loadBooks(): void {
    this.isLoading = true
    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books = books
        this.isLoading = false
      },
      error: () => {
        this.isLoading = false
      },
    })
  }

  onBookDeleted(bookId: string): void {
    this.books = this.books.filter((book) => book.id !== bookId)
  }
}

