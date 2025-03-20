import { Component, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"
import { BookService } from "../services/book.service"
import type { Book } from "../../../shared/models/book.model"
import { BookCardComponent } from "../components/book-card/book-card.component"

@Component({
  selector: "app-book-list",
  standalone: true,
  imports: [CommonModule, RouterLink, BookCardComponent],
  template: `
    <div class="book-list-container">
      <div class="header">
        <h1>My Books</h1>
        <a routerLink="/books/new" class="btn-create">Create New Book</a>
      </div>
      
      @if (isLoading) {
        <div class="loading">
          <p>Loading your books...</p>
        </div>
      } @else if (books.length === 0) {
        <div class="empty-state">
          <h2>You don't have any books yet</h2>
          <p>Create your first AI-generated book to get started</p>
          <a routerLink="/books/new" class="btn-primary">Create Your First Book</a>
        </div>
      } @else {
        <div class="book-categories">
          @if (inProgressBooks.length > 0) {
            <section class="book-section">
              <h2>In Progress</h2>
              <div class="book-grid">
                @for (book of inProgressBooks; track book.id) {
                  <app-book-card [book]="book" (deleted)="onBookDeleted($event)"></app-book-card>
                }
              </div>
            </section>
          }
          
          @if (completedBooks.length > 0) {
            <section class="book-section">
              <h2>Completed</h2>
              <div class="book-grid">
                @for (book of completedBooks; track book.id) {
                  <app-book-card [book]="book" (deleted)="onBookDeleted($event)"></app-book-card>
                }
              </div>
            </section>
          }
          
          @if (draftBooks.length > 0) {
            <section class="book-section">
              <h2>Drafts</h2>
              <div class="book-grid">
                @for (book of draftBooks; track book.id) {
                  <app-book-card [book]="book" (deleted)="onBookDeleted($event)"></app-book-card>
                }
              </div>
            </section>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
    .book-list-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .header {
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
    
    .book-section {
      margin-bottom: 3rem;
    }
    
    .book-section h2 {
      font-size: 1.5rem;
      color: #2c3e50;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #ecf0f1;
    }
    
    .book-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    
    @media (max-width: 768px) {
      .header {
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
export class BookListComponent implements OnInit {
  private bookService = inject(BookService)

  books: Book[] = []
  isLoading = true

  get inProgressBooks(): Book[] {
    return this.books.filter((book) => book.status === "generating")
  }

  get completedBooks(): Book[] {
    return this.books.filter((book) => book.status === "completed")
  }

  get draftBooks(): Book[] {
    return this.books.filter((book) => book.status === "draft")
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

