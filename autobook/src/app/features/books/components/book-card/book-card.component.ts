import { Component, EventEmitter, Input, Output, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"
import type { Book } from "../../../../shared/models/book.model"
import { BookService } from "../../services/book.service"

@Component({
  selector: "app-book-card",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="book-card">
      <div class="book-cover">
        @if (book.coverImage) {
          <img [src]="book.coverImage" [alt]="book.title + ' cover'" />
        } @else {
          <div class="placeholder-cover">
            <span>{{ book.title.charAt(0) }}</span>
          </div>
        }
        
        @if (book.status === 'generating') {
          <div class="progress-overlay">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="book.progress"></div>
            </div>
            <span class="progress-text">{{ book.progress }}%</span>
          </div>
        }
      </div>
      
      <div class="book-info">
        <h3 class="book-title">{{ book.title }}</h3>
        <p class="book-description">{{ book.description | slice:0:100 }}{{ book.description.length > 100 ? '...' : '' }}</p>
        
        <div class="book-meta">
          <span class="book-type">{{ book.type === 'text-only' ? 'Text Only' : 'With Images' }}</span>
          <span class="book-status" [ngClass]="book.status">{{ book.status | titlecase }}</span>
        </div>
        
        <div class="book-actions">
          <a [routerLink]="['/books', book.id]" class="btn-view">View</a>
          <a [routerLink]="['/books', book.id, 'edit']" class="btn-edit">Edit</a>
          <button class="btn-delete" (click)="onDelete()">Delete</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .book-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .book-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    }
    
    .book-cover {
      height: 200px;
      position: relative;
      overflow: hidden;
    }
    
    .book-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .placeholder-cover {
      width: 100%;
      height: 100%;
      background-color: #3498db;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .placeholder-cover span {
      font-size: 4rem;
      color: white;
      font-weight: bold;
    }
    
    .progress-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: rgba(0, 0, 0, 0.7);
      padding: 0.5rem;
      color: white;
    }
    
    .progress-bar {
      height: 8px;
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.25rem;
    }
    
    .progress-fill {
      height: 100%;
      background-color: #2ecc71;
    }
    
    .progress-text {
      font-size: 0.8rem;
    }
    
    .book-info {
      padding: 1rem;
    }
    
    .book-title {
      font-size: 1.2rem;
      margin: 0 0 0.5rem;
      color: #2c3e50;
    }
    
    .book-description {
      font-size: 0.9rem;
      color: #7f8c8d;
      margin-bottom: 1rem;
      line-height: 1.4;
    }
    
    .book-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      font-size: 0.8rem;
    }
    
    .book-type {
      background-color: #ecf0f1;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      color: #7f8c8d;
    }
    
    .book-status {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: 500;
    }
    
    .book-status.draft {
      background-color: #ecf0f1;
      color: #7f8c8d;
    }
    
    .book-status.generating {
      background-color: #3498db;
      color: white;
    }
    
    .book-status.completed {
      background-color: #2ecc71;
      color: white;
    }
    
    .book-status.failed {
      background-color: #e74c3c;
      color: white;
    }
    
    .book-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .book-actions a, .book-actions button {
      flex: 1;
      padding: 0.5rem;
      border-radius: 4px;
      text-align: center;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background-color 0.3s;
      text-decoration: none;
    }
    
    .btn-view {
      background-color: #3498db;
      color: white;
    }
    
    .btn-view:hover {
      background-color: #2980b9;
    }
    
    .btn-edit {
      background-color: #f39c12;
      color: white;
    }
    
    .btn-edit:hover {
      background-color: #d35400;
    }
    
    .btn-delete {
      background-color: #e74c3c;
      color: white;
      border: none;
    }
    
    .btn-delete:hover {
      background-color: #c0392b;
    }
  `,
  ],
})
export class BookCardComponent {
  @Input() book!: Book
  @Output() deleted = new EventEmitter<string>()

  private bookService = inject(BookService)

  onDelete(): void {
    if (confirm(`Are you sure you want to delete "${this.book.title}"?`)) {
      this.bookService.deleteBook(this.book.id).subscribe({
        next: () => {
          this.deleted.emit(this.book.id)
        },
      })
    }
  }
}

