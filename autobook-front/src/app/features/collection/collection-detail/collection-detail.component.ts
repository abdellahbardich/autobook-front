import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CollectionService } from '../../../core/services/collection.service';
import { BookService } from '../../../core/services/book.service';
import { CollectionDetail } from '../../../core/models/collection.model';
import { Book, BookStatus } from '../../../core/models/book.model';
import { CommonModule } from '@angular/common';
import { SecureImageComponent } from '../../conversation/secure-image.component';

@Component({
  selector: 'app-collection-detail',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterLink,ReactiveFormsModule,SecureImageComponent],
  templateUrl: './collection-detail.component.html',
  styleUrls: ['./collection-detail.component.scss']
})
export class CollectionDetailComponent implements OnInit {
  collectionId!: number;
  collection: CollectionDetail | null = null;
  books: Book[] = [];
  
  editForm: FormGroup;
  isEditing = false;
  
  loading = false;
  error = '';
  
  BookStatus = BookStatus;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private collectionService: CollectionService,
    private bookService: BookService
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }
  
  ngOnInit(): void {
    this.collectionId = +this.route.snapshot.paramMap.get('id')!;
    this.loadCollection();
  }
  
  loadCollection(): void {
    this.loading = true;
    this.collectionService.getCollectionDetails(this.collectionId)
      .subscribe({
        next: collection => {
          this.collection = collection;
          this.books = collection.books;
          this.loading = false;
          
          // Populate edit form
          this.editForm.patchValue({
            name: collection.name,
            description: collection.description
          });
        },
        error: err => {
          this.error = 'Failed to load collection details';
          console.error(err);
          this.loading = false;
        }
      });
  }
  
  updateCollection(): void {
    if (this.editForm.invalid) return;
    
    this.loading = true;
    this.collectionService.updateCollection(this.collectionId, this.editForm.value)
      .subscribe({
        next: () => {
          this.loadCollection();
          this.isEditing = false;
        },
        error: err => {
          this.error = 'Failed to update collection';
          console.error(err);
          this.loading = false;
        }
      });
  }
  
  removeBook(bookId: number): void {
    if (confirm('Are you sure you want to remove this book from the collection?')) {
      this.collectionService.removeBookFromCollection(this.collectionId, bookId)
        .subscribe({
          next: () => {
            this.books = this.books.filter(b => b.bookId !== bookId);
          },
          error: err => {
            this.error = 'Failed to remove book from collection';
            console.error(err);
          }
        });
    }
  }
  
  viewBook(bookId: number): void {
    this.router.navigate(['/books', bookId]);
  }
  viewBookDetails(bookId: number | undefined): void {
    if (bookId) {
      this.router.navigate(['/books', bookId]);
    } else {
      console.error('Cannot view book: ID is undefined');
    }
  }
  
  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.collection) {
      this.editForm.patchValue({
        name: this.collection.name,
        description: this.collection.description
      });
    }
  }
  
//   getBookCoverUrl(bookId: number): string {
//     return this.bookService.getBookCoverUrl(bookId);
//   }
getBookCoverUrl(bookId: number | undefined): string {
    if (!bookId) {
      return 'assets/images/placeholder-cover.jpg';
    }
    return this.bookService.getBookCoverUrl(bookId);
  }
}