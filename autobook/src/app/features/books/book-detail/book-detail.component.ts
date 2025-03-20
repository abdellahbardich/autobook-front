import { Component, type OnDestroy, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, Router, RouterLink } from "@angular/router"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { type Subscription, interval } from "rxjs"
import { switchMap } from "rxjs/operators"
import { BookService } from "../services/book.service"
import type { Book } from "../../../shared/models/book.model"
import { PdfPreviewComponent } from "../components/pdf-preview/pdf-preview.component"

@Component({
  selector: "app-book-detail",
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, PdfPreviewComponent],
  template: `
    <div class="book-detail-container">
      @if (isLoading) {
        <div class="loading">
          <p>Loading book details...</p>
        </div>
      } @else if (!book) {
        <div class="not-found">
          <h2>Book Not Found</h2>
          <p>The book you're looking for doesn't exist or has been deleted.</p>
          <a routerLink="/books" class="btn-primary">Back to Books</a>
        </div>
      } @else {
        <div class="book-header">
          <h1>{{ book.title }}</h1>
          <div class="book-meta">
            <span class="book-type">{{ book.type === 'text-only' ? 'Text Only' : 'With Images' }}</span>
            <span class="book-status" [ngClass]="book.status">{{ book.status | titlecase }}</span>
          </div>
        </div>
        
        <div class="book-content">
          <div class="book-info">
            <div class="book-cover">
              @if (book.coverImage) {
                <img [src]="book.coverImage" [alt]="book.title + ' cover'" />
              } @else {
                <div class="placeholder-cover">
                  <span>{{ book.title.charAt(0) }}</span>
                </div>
              }
            </div>
            
            <div class="book-details">
              <h2>Description</h2>
              <p>{{ book.description }}</p>
              
              <div class="book-actions">
                <a [routerLink]="['/books', book.id, 'edit']" class="btn-edit">Edit Book</a>
                <a [routerLink]="['/books', book.id, 'conversation']" class="btn-conversation">Open Conversation</a>
                
                @if (book.status === 'completed' && book.pdfUrl) {
                  <button class="btn-download" (click)="downloadPdf()">Download PDF</button>
                }
                
                @if (book.status === 'draft') {
                  <button class="btn-generate" (click)="showGenerateForm = true">Generate Book</button>
                }
                
                <button class="btn-delete" (click)="deleteBook()">Delete Book</button>
              </div>
            </div>
          </div>
          
          @if (book.status === 'generating') {
            <div class="generation-progress">
              <h2>Generation Progress</h2>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="book.progress"></div>
              </div>
              <span class="progress-text">{{ book.progress }}% Complete</span>
            </div>
          }
          
          @if (showGenerateForm) {
            <div class="generate-form-container">
              <h2>Generate Book</h2>
              <form [formGroup]="generateForm" (ngSubmit)="generateBook()">
                <div class="form-group">
                  <label for="prompt">Generation Prompt</label>
                  <textarea 
                    id="prompt" 
                    formControlName="prompt" 
                    placeholder="Describe what you want in your book..."
                    rows="5"
                  ></textarea>
                  @if (prompt?.invalid && (prompt?.dirty || prompt?.touched)) {
                    <div class="error-message">
                      @if (prompt?.errors?.['required']) {
                        <span>Prompt is required</span>
                      }
                    </div>
                  }
                </div>
                
                <div class="form-actions">
                  <button type="button" class="btn-cancel" (click)="showGenerateForm = false">Cancel</button>
                  <button 
                    type="submit" 
                    class="btn-submit" 
                    [disabled]="generateForm.invalid || isGenerating"
                  >
                    {{ isGenerating ? 'Starting Generation...' : 'Start Generation' }}
                  </button>
                </div>
              </form>
            </div>
          }
          
          @if (book.previewImages && book.previewImages.length > 0) {
            <div class="preview-images">
              <h2>Preview Images</h2>
              <div class="image-grid">
                @for (image of book.previewImages; track image) {
                  <div class="preview-image">
                    <img [src]="image" alt="Book preview" />
                  </div>
                }
              </div>
            </div>
          }
          
          @if (book.status === 'completed' && book.pdfUrl) {
            <app-pdf-preview [pdfUrl]="book.pdfUrl"></app-pdf-preview>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
    .book-detail-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .loading, .not-found {
      text-align: center;
      padding: 3rem;
      background-color: #f8f9fa;
      border-radius: 8px;
    }
    
    .not-found h2 {
      font-size: 1.5rem;
      color: #2c3e50;
      margin-bottom: 1rem;
    }
    
    .not-found p {
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
    
    .book-header {
      margin-bottom: 2rem;
    }
    
    .book-header h1 {
      font-size: 2rem;
      color: #2c3e50;
      margin: 0 0 0.5rem;
    }
    
    .book-meta {
      display: flex;
      gap: 1rem;
    }
    
    .book-type {
      background-color: #ecf0f1;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      color: #7f8c8d;
      font-size: 0.9rem;
    }
    
    .book-status {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: 500;
      font-size: 0.9rem;
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
    
    .book-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .book-info {
      display: flex;
      gap: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 2rem;
    }
    
    .book-cover {
      width: 200px;
      height: 300px;
      flex-shrink: 0;
      overflow: hidden;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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
    
    .book-details {
      flex: 1;
    }
    
    .book-details h2 {
      font-size: 1.5rem;
      color: #2c3e50;
      margin: 0 0 1rem;
    }
    
    .book-details p {
      color: #7f8c8d;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    
    .book-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .book-actions a, .book-actions button {
      padding: 0.75rem 1rem;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background-color 0.3s;
      text-decoration: none;
      text-align: center;
    }
    
    .btn-edit {
      background-color: #f39c12;
      color: white;
    }
    
    .btn-edit:hover {
      background-color: #d35400;
    }
    
    .btn-conversation {
      background-color: #3498db;
      color: white;
    }
    
    .btn-conversation:hover {
      background-color: #2980b9;
    }
    
    .btn-download {
      background-color: #2ecc71;
      color: white;
      border: none;
    }
    
    .btn-download:hover {
      background-color: #27ae60;
    }
    
    .btn-generate {
      background-color: #9b59b6;
      color: white;
      border: none;
    }
    
    .btn-generate:hover {
      background-color: #8e44ad;
    }
    
    .btn-delete {
      background-color: #e74c3c;
      color: white;
      border: none;
    }
    
    .btn-delete:hover {
      background-color: #c0392b;
    }
    
    .generation-progress {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 2rem;
    }
    
    .generation-progress h2 {
      font-size: 1.5rem;
      color: #2c3e50;
      margin: 0 0 1rem;
    }
    
    .progress-bar {
      height: 20px;
      background-color: #ecf0f1;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }
    
    .progress-fill {
      height: 100%;
      background-color: #3498db;
      transition: width 0.3s ease;
    }
    
    .progress-text {
      font-size: 0.9rem;
      color: #7f8c8d;
    }
    
    .generate-form-container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 2rem;
    }
    
    .generate-form-container h2 {
      font-size: 1.5rem;
      color: #2c3e50;
      margin: 0 0 1rem;
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
    
    textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      resize: vertical;
    }
    
    textarea:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
    
    .error-message {
      color: #e74c3c;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
    
    .btn-cancel {
      background-color: #ecf0f1;
      color: #7f8c8d;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-cancel:hover {
      background-color: #bdc3c7;
    }
    
    .btn-submit {
      background-color: #9b59b6;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-submit:hover {
      background-color: #8e44ad;
    }
    
    .btn-submit:disabled {
      background-color: #95a5a6;
      cursor: not-allowed;
    }
    
    .preview-images {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 2rem;
    }
    
    .preview-images h2 {
      font-size: 1.5rem;
      color: #2c3e50;
      margin: 0 0 1rem;
    }
    
    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .preview-image {
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .preview-image img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      transition: transform 0.3s;
      cursor: pointer;
    }
    
    .preview-image img:hover {
      transform: scale(1.05);
    }
    
    @media (max-width: 768px) {
      .book-info {
        flex-direction: column;
      }
      
      .book-cover {
        width: 100%;
        height: 250px;
      }
    }
  `,
  ],
})
export class BookDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private bookService = inject(BookService)
  private fb = inject(FormBuilder)

  book: Book | null = null
  isLoading = true
  showGenerateForm = false
  isGenerating = false

  generateForm: FormGroup = this.fb.group({
    prompt: ["", Validators.required],
  })

  private progressSubscription?: Subscription

  get prompt() {
    return this.generateForm.get("prompt")
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get("id")
      if (id) {
        this.loadBook(id)
      } else {
        this.isLoading = false
      }
    })
  }

  ngOnDestroy(): void {
    this.progressSubscription?.unsubscribe()
  }

  loadBook(id: string): void {
    this.isLoading = true
    this.bookService.getBook(id).subscribe({
      next: (book) => {
        this.book = book
        this.isLoading = false

        // If book is generating, start polling for progress
        if (book.status === "generating") {
          this.startProgressPolling(id)
        }
      },
      error: () => {
        this.isLoading = false
        this.book = null
      },
    })
  }

  startProgressPolling(bookId: string): void {
    // Poll every 3 seconds
    this.progressSubscription = interval(3000)
      .pipe(switchMap(() => this.bookService.getBookProgress(bookId)))
      .subscribe((book) => {
        this.book = book

        // Stop polling if book is no longer generating
        if (book.status !== "generating") {
          this.progressSubscription?.unsubscribe()
        }
      })
  }

  generateBook(): void {
    if (this.generateForm.invalid || !this.book) return

    this.isGenerating = true
    const prompt = this.generateForm.value.prompt

    this.bookService.generateBook(this.book.id, prompt).subscribe({
      next: (book) => {
        this.book = book
        this.showGenerateForm = false
        this.isGenerating = false

        // Start polling for progress
        this.startProgressPolling(book.id)
      },
      error: () => {
        this.isGenerating = false
      },
    })
  }

  downloadPdf(): void {
    if (!this.book) return

    this.bookService.downloadPdf(this.book.id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${this.book?.title.replace(/\s+/g, "_")}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    })
  }

  deleteBook(): void {
    if (!this.book) return

    if (confirm(`Are you sure you want to delete "${this.book.title}"?`)) {
      this.bookService.deleteBook(this.book.id).subscribe({
        next: () => {
          this.router.navigate(["/books"])
        },
      })
    }
  }
}

