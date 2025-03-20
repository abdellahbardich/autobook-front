import { Component, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { BookService } from "../services/book.service"
import type { BookType } from "../../../shared/models/book.model"

@Component({
  selector: "app-book-create",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="create-book-container">
      <div class="create-book-card">
        <h1>Create New Book</h1>
        
        <form [formGroup]="bookForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="title">Book Title</label>
            <input 
              type="text" 
              id="title" 
              formControlName="title" 
              placeholder="Enter book title"
            >
            @if (title?.invalid && (title?.dirty || title?.touched)) {
              <div class="error-message">
                @if (title?.errors?.['required']) {
                  <span>Title is required</span>
                }
              </div>
            }
          </div>
          
          <div class="form-group">
            <label for="description">Description</label>
            <textarea 
              id="description" 
              formControlName="description" 
              placeholder="Enter book description"
              rows="4"
            ></textarea>
            @if (description?.invalid && (description?.dirty || description?.touched)) {
              <div class="error-message">
                @if (description?.errors?.['required']) {
                  <span>Description is required</span>
                }
              </div>
            }
          </div>
          
          <div class="form-group">
            <label>Book Type</label>
            <div class="book-type-options">
              <div 
                class="book-type-option" 
                [class.selected]="bookForm.get('type')?.value === 'text-only'"
                (click)="selectBookType('text-only')"
              >
                <div class="option-icon text-only">T</div>
                <div class="option-info">
                  <h3>Text Only</h3>
                  <p>Generate a book with text content only</p>
                </div>
              </div>
              
              <div 
                class="book-type-option" 
                [class.selected]="bookForm.get('type')?.value === 'with-images'"
                (click)="selectBookType('with-images')"
              >
                <div class="option-icon with-images">I</div>
                <div class="option-info">
                  <h3>With Images</h3>
                  <p>Generate a book with text and AI-generated images</p>
                </div>
              </div>
            </div>
            @if (type?.invalid && (type?.dirty || type?.touched)) {
              <div class="error-message">
                @if (type?.errors?.['required']) {
                  <span>Please select a book type</span>
                }
              </div>
            }
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancel()">Cancel</button>
            <button 
              type="submit" 
              class="btn-create" 
              [disabled]="bookForm.invalid || isSubmitting"
            >
              {{ isSubmitting ? 'Creating...' : 'Create Book' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
    .create-book-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .create-book-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 2rem;
    }
    
    h1 {
      text-align: center;
      margin-bottom: 2rem;
      color: #2c3e50;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #2c3e50;
    }
    
    input, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    input:focus, textarea:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
    
    .error-message {
      color: #e74c3c;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }
    
    .book-type-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 0.5rem;
    }
    
    .book-type-option {
      border: 2px solid #ecf0f1;
      border-radius: 8px;
      padding: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s;
    }
    
    .book-type-option:hover {
      border-color: #3498db;
      background-color: #f8f9fa;
    }
    
    .book-type-option.selected {
      border-color: #3498db;
      background-color: rgba(52, 152, 219, 0.1);
    }
    
    .option-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
    }
    
    .option-icon.text-only {
      background-color: #3498db;
    }
    
    .option-icon.with-images {
      background-color: #9b59b6;
    }
    
    .option-info h3 {
      margin: 0 0 0.25rem;
      font-size: 1rem;
      color: #2c3e50;
    }
    
    .option-info p {
      margin: 0;
      font-size: 0.85rem;
      color: #7f8c8d;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }
    
    .btn-cancel, .btn-create {
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-cancel {
      background-color: #ecf0f1;
      color: #7f8c8d;
      border: none;
    }
    
    .btn-cancel:hover {
      background-color: #bdc3c7;
    }
    
    .btn-create {
      background-color: #3498db;
      color: white;
      border: none;
    }
    
    .btn-create:hover {
      background-color: #2980b9;
    }
    
    .btn-create:disabled {
      background-color: #95a5a6;
      cursor: not-allowed;
    }
    
    @media (max-width: 768px) {
      .book-type-options {
        grid-template-columns: 1fr;
      }
    }
  `,
  ],
})
export class BookCreateComponent {
  private fb = inject(FormBuilder)
  private bookService = inject(BookService)
  private router = inject(Router)

  bookForm: FormGroup = this.fb.group({
    title: ["", Validators.required],
    description: ["", Validators.required],
    type: ["text-only", Validators.required],
  })

  isSubmitting = false

  get title() {
    return this.bookForm.get("title")
  }
  get description() {
    return this.bookForm.get("description")
  }
  get type() {
    return this.bookForm.get("type")
  }

  selectBookType(type: BookType): void {
    this.bookForm.patchValue({ type })
  }

  onSubmit(): void {
    if (this.bookForm.invalid) return

    this.isSubmitting = true
    this.bookService.createBook(this.bookForm.value).subscribe({
      next: (book) => {
        this.router.navigate(["/books", book.id])
      },
      error: () => {
        this.isSubmitting = false
      },
    })
  }

  cancel(): void {
    this.router.navigate(["/books"])
  }
}

