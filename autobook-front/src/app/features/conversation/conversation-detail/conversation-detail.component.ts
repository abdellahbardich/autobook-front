import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConversationService } from '../../../core/services/conversation.service';
import { BookService } from '../../../core/services/book.service';
import { ConversationDetail, Message } from '../../../core/models/conversation.model';
import { Book, BookType, CreateBookRequest, BookStatus } from '../../../core/models/book.model';
import { interval, Subscription } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { SecureImageComponent } from '../secure-image.component';

@Component({
  selector: 'app-conversation-detail',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, ReactiveFormsModule, SecureImageComponent],
  templateUrl: './conversation-detail.component.html',
  styleUrls: ['./conversation-detail.component.scss']
})
export class ConversationDetailComponent implements OnInit, OnDestroy {
  conversationId!: number;
  conversation: ConversationDetail | null = null;
  books: Book[] = [];
activeTab: 'books' | 'settings' = 'books';
  messageForm: FormGroup;
  bookForm: FormGroup;
  
  showBookForm = false;
  loading = false;
  error = '';
  
  BookType = BookType;
  BookStatus = BookStatus;
  bookProgress: Map<number, {
    startTime: number;
    currentStep: number;
    progressPercent: number;
    estimatedTimeLeft: string;
  }> = new Map();
  readonly TOTAL_GENERATION_TIME = 900; 
  readonly GENERATION_STEPS = 4;
  
  private progressInterval: Map<number, any> = new Map();
  private statusCheckSubscription?: Subscription;
  private bookParameters?: {
    bookType: BookType;
    stylePrompt: string;
    numChapters: number;
    includeIllustrations: boolean;
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private conversationService: ConversationService,
    private bookService: BookService
  ) {
    this.messageForm = this.fb.group({
      content: ['', Validators.required]
    });
    
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      prompt: ['', Validators.required],
      bookType: [BookType.TEXT_IMAGE, Validators.required],
      stylePrompt: ['Fantasy, magical, colorful'],
      numChapters: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
      includeIllustrations: [true]
    });
  }
  
  ngOnInit(): void {
    this.conversationId = +this.route.snapshot.paramMap.get('id')!;
  
    // First try to get the parameters from router state...
    if (history.state.bookParameters) {
      this.bookParameters = history.state.bookParameters;
      // Store in localStorage for persistence
      localStorage.setItem(`conversation-${this.conversationId}-bookParameters`, JSON.stringify(this.bookParameters));
    } else {
      // ...otherwise try retrieving them from localStorage.
      const storedParams = localStorage.getItem(`conversation-${this.conversationId}-bookParameters`);
      if (storedParams) {
        this.bookParameters = JSON.parse(storedParams);
      }
    }
    
    this.loadConversation();
    this.loadBooks();
  
    this.statusCheckSubscription = interval(5000).subscribe(() => {
      this.checkBookStatuses();
    });
  }
  
  ngOnDestroy(): void {
    if (this.statusCheckSubscription) {
      this.statusCheckSubscription.unsubscribe();
    }
    
    this.progressInterval.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.progressInterval.clear();
  }

  // New helper method to determine if progress should be shown for a book
  shouldShowProgress(bookId?: number): boolean {
    if (!bookId) return false;
    return this.bookProgress.has(bookId);
  }
  
  startTrackingProgress(book: Book): void {
    if (!book.bookId) return;
    
    // If we're already tracking this book, don't start again
    if (this.bookProgress.has(book.bookId)) return;
    
    console.log(`Starting progress tracking for book ${book.bookId} with status ${book.status}`);
    
    // Initialize progress tracking for this book
    this.bookProgress.set(book.bookId, {
      startTime: Date.now(),
      currentStep: 1,
      progressPercent: 0,
      estimatedTimeLeft: '1:30'
    });
    
    // Create an interval to update progress
    const intervalId = setInterval(() => {
      this.updateBookProgress(book.bookId!);
    }, 100); // Update every 100ms for smooth animation
    
    this.progressInterval.set(book.bookId, intervalId);
  }
  
  updateBookProgress(bookId: number): void {
    const progress = this.bookProgress.get(bookId);
    if (!progress) return;
    
    const now = Date.now();
    const elapsed = now - progress.startTime;
    
    // Calculate progress percentage
    const progressPercent = Math.min(100, (elapsed / this.TOTAL_GENERATION_TIME) * 100);
    
    // Calculate current step based on progress percentage
    let currentStep = 1;
    if (progressPercent >= 25) currentStep = 2;
    if (progressPercent >= 50) currentStep = 3;
    if (progressPercent >= 75) currentStep = 4;
    
    // Calculate time left in seconds
    const timeLeftMs = Math.max(0, this.TOTAL_GENERATION_TIME - elapsed);
    const timeLeftSec = Math.ceil(timeLeftMs / 1000);
    const minutes = Math.floor(timeLeftSec / 60);
    const seconds = timeLeftSec % 60;
    const estimatedTimeLeft = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Update progress
    this.bookProgress.set(bookId, {
      ...progress,
      progressPercent,
      currentStep,
      estimatedTimeLeft
    });
    
    // If we've reached the end, clear the interval and trigger completion
    if (progressPercent >= 100) {
      this.clearProgressInterval(bookId);
      this.completeBookGeneration(bookId);
    }
  }
  
  clearProgressInterval(bookId: number): void {
    const intervalId = this.progressInterval.get(bookId);
    if (intervalId) {
      console.log(`Clearing progress interval for book ${bookId}`);
      this.loadBooks();

      clearInterval(intervalId);
      this.progressInterval.delete(bookId);
    }
  }
  
  completeBookGeneration(bookId: number): void {
    // Find the book and update its status
    const book = this.books.find(b => b.bookId === bookId);
    if (book) {
      // Update the status to COMPLETE
      this.bookService.getBookStatus(bookId).subscribe({
        next: response => {
          book.status = response.status;
        }
      });
    }
  }
  
  getProgressPercentage(bookId?: number): number {
    if (!bookId) return 0;
    const progress = this.bookProgress.get(bookId);
    return progress ? progress.progressPercent : 0;
  }
  
  getProgressStep(bookId?: number): number {
    if (!bookId) return 0;
    const progress = this.bookProgress.get(bookId);
    return progress ? progress.currentStep : 0;
  }
  
  getEstimatedTimeLeft(bookId?: number): string {
    if (!bookId) return '1:30';
    const progress = this.bookProgress.get(bookId);
    return progress ? progress.estimatedTimeLeft : '1:30';
  }
  
  loadConversation(): void {
    this.loading = true;
    this.conversationService.getConversationDetails(this.conversationId)
      .pipe(
        catchError(err => {
          this.error = 'Failed to load conversation';
          console.error(err);
          throw err;
        }),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: conversation => {
          this.conversation = conversation;
          // Scroll to bottom of messages
          setTimeout(() => this.scrollToBottom(), 100);
        }
      });
  }
  
  loadBooks(): void {
    this.bookService.getBooksInConversation(this.conversationId)
      .pipe(
        catchError(err => {
          console.error('Failed to load books:', err);
          return [];
        })
      )
      .subscribe({
        next: books => {
          // Preserve progress tracking when refreshing books
          const newBooks = books.map(book => {
            // Start tracking for any PROCESSING books if not already tracking
            if (book.bookId && book.status === BookStatus.PROCESSING) {
              this.startTrackingProgress(book);
            }
            return book;
          });
          this.books = newBooks;
        }
      });
  }
  
  checkBookStatuses(): void {
    const pendingBooks = this.books.filter(book => 
      book.status === BookStatus.PROCESSING || book.status === BookStatus.DRAFT
    );
  
    pendingBooks.forEach(book => {
      if (book.bookId) {
        // Start tracking progress for PROCESSING books
        if (book.status === BookStatus.PROCESSING) {
          this.startTrackingProgress(book);
        }
        
        this.bookService.getBookStatus(book.bookId).subscribe({
          next: response => {
            console.log(`Book ${book.bookId} status update: ${book.status} -> ${response.status}`);
            
            if (response.status !== book.status) {
              book.status = response.status;
              
              // Only clear progress when book is COMPLETE and we've already shown a full progress
              const progress = this.bookProgress.get(book.bookId!);
              if (response.status === BookStatus.COMPLETE && progress && progress.progressPercent >= 95) {
                this.clearProgressInterval(book.bookId);
                // this.loadBooks();
              }
            }
          },
          error: (err) => {
            console.error(`Error checking status for book ${book.bookId}:`, err);
          }
        });
      }
    });
  }
  
  sendMessage(): void {
    if (this.messageForm.invalid) return;
  
    const content = this.messageForm.value.content;
    this.loading = true;
  
    this.conversationService.addMessage(this.conversationId, { content, role: 'USER' })
      .pipe(
        tap(() => console.log('Message added successfully')),
        switchMap((message: Message) => {
          if (!this.bookParameters) {
            console.error('No book parameters found');
            throw new Error('No book parameters found');
          }
          console.log('Book parameters:', this.bookParameters);
  
          const bookRequest: CreateBookRequest = {
            title: `${this.conversation?.title} - ${new Date().toLocaleString()}`,
            prompt: content,
            conversationId: this.conversationId,
            messageId: message.id,
            ...this.bookParameters
          };
  
          console.log('Creating book with request:', bookRequest);
          return this.bookService.createBook(bookRequest);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.loadConversation();
          this.loadBooks();
          this.messageForm.reset();
        },
        error: (err) => {
          this.error = 'Failed to send message or create book';
          console.error(err);
        }
      });
  }
  
  toggleBookForm(): void {
    this.showBookForm = !this.showBookForm;
    if (this.showBookForm) {
      // Pre-populate prompt from last message if available
      if (this.conversation?.messages.length) {
        const lastMessage = this.conversation.messages[this.conversation.messages.length - 1];
        if (lastMessage.sender === 'USER') {
          this.bookForm.patchValue({ prompt: lastMessage.content });
        }
      }
    }
  }
  
  createBook(): void {
    if (this.bookForm.invalid) return;
    
    // Find the latest user message ID to associate with the book
    let messageId: number | undefined;
    if (this.conversation?.messages) {
      const userMessages = this.conversation.messages.filter(m => m.sender === 'USER');
      if (userMessages.length > 0) {
        messageId = userMessages[userMessages.length - 1].id;
      }
    }
    
    const request: CreateBookRequest = {
      ...this.bookForm.value,
      conversationId: this.conversationId,
      messageId
    };
    
    this.loading = true;
    this.bookService.createBook(request)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.showBookForm = false;
        })
      )
      .subscribe({
        next: () => {
          this.loadBooks();
          this.bookForm.reset({
            bookType: BookType.TEXT_IMAGE,
            stylePrompt: 'Fantasy, magical, colorful',
            numChapters: 3,
            includeIllustrations: true
          });
        },
        error: err => {
          this.error = 'Failed to create book';
          console.error(err);
        }
      });
  }
  
  downloadBook(bookId: number): void {
    this.bookService.downloadBook(bookId)
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `book-${bookId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
  
  viewBookDetails(bookId: number): void {
    this.router.navigate(['/books', bookId]);
  }
  
  getBookCoverUrl(bookId: number): string {
    return this.bookService.getBookCoverUrl(bookId);
  }
  
  scrollToBottom(): void {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
}