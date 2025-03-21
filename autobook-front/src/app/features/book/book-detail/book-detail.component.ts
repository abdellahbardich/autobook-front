import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookService } from '../../../core/services/book.service';
import { CollectionService } from '../../../core/services/collection.service';
import { BookDetail, BookStatus, BookType } from '../../../core/models/book.model';
import { Collection } from '../../../core/models/collection.model';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss']
})
export class BookDetailComponent implements OnInit, OnDestroy {
  bookId!: number;
  book: BookDetail | null = null;
  collections: Collection[] = [];
  selectedCollectionId: number | null = null;
  
  loading = false;
  error = '';
  
  BookStatus = BookStatus;
  BookType = BookType;
  
  private statusCheckSubscription?: Subscription;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private collectionService: CollectionService
  ) {}
  
  ngOnInit(): void {
    this.bookId = +this.route.snapshot.paramMap.get('id')!;
    this.loadBook();
    this.loadCollections();
    
    // If book is still generating, check status periodically
    this.statusCheckSubscription = interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.bookService.getBookStatus(this.bookId))
      )
      .subscribe({
        next: response => {
          if (this.book && this.book.status !== response.status) {
            if (response.status === BookStatus.COMPLETED) {
              this.loadBook(); // Reload book when complete
            } else {
              this.book.status = response.status;
            }
          }
        }
      });
  }
  
  ngOnDestroy(): void {
    if (this.statusCheckSubscription) {
      this.statusCheckSubscription.unsubscribe();
    }
  }
  
  loadBook(): void {
    this.loading = true;
    this.bookService.getBookById(this.bookId)
      .subscribe({
        next: book => {
          this.book = book;
          this.loading = false;
          
          // If book is complete, stop checking status
          if (book.status === BookStatus.COMPLETED || book.status === BookStatus.FAILED) {
            this.statusCheckSubscription?.unsubscribe();
          }
        },
        error: err => {
          this.error = 'Failed to load book details';
          console.error(err);
          this.loading = false;
        }
      });
  }
  
  loadCollections(): void {
    this.collectionService.getCollections()
      .subscribe({
        next: collections => {
          this.collections = collections;
        },
        error: err => {
          console.error('Failed to load collections:', err);
        }
      });
  }
  
  downloadBook(): void {
    this.bookService.downloadBook(this.bookId)
      .subscribe({
        next: blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${this.book?.title || 'book'}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: err => {
          this.error = 'Failed to download book';
          console.error(err);
        }
      });
  }
  
  addToCollection(): void {
    if (!this.selectedCollectionId) return;
    
    this.collectionService.addBookToCollection(this.selectedCollectionId, this.bookId)
      .subscribe({
        next: () => {
          alert('Book added to collection successfully');
          this.selectedCollectionId = null;
        },
        error: err => {
          this.error = 'Failed to add book to collection';
          console.error(err);
        }
      });
  }
  
  goToConversation(): void {
    if (this.book?.conversationId) {
      this.router.navigate(['/conversations', this.book.conversationId]);
    }
  }
  
  deleteBook(): void {
    if (confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      this.bookService.deleteBook(this.bookId)
        .subscribe({
          next: () => {
            this.router.navigate(['/conversations']);
          },
          error: err => {
            this.error = 'Failed to delete book';
            console.error(err);
          }
        });
    }
  }
  
  getStatusBadgeClass(): string {
    if (!this.book) return '';
    
    switch (this.book.status) {
      case BookStatus.PENDING: return 'badge-warning';
      case BookStatus.GENERATING: return 'badge-info';
      case BookStatus.COMPLETED: return 'badge-success';
      case BookStatus.FAILED: return 'badge-danger';
      default: return '';
    }
  }
  
  getCoverUrl(): string {
    return this.bookService.getBookCoverUrl(this.bookId);
  }
}