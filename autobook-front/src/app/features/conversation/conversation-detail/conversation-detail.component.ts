import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConversationService } from '../../../core/services/conversation.service';
import { BookService } from '../../../core/services/book.service';
import { ConversationDetail } from '../../../core/models/conversation.model';
import { Book, BookType, CreateBookRequest, BookStatus } from '../../../core/models/book.model';
import { interval, Subscription } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { SecureImageComponent } from '../secure-image.component';

@Component({
  selector: 'app-conversation-detail',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterLink,ReactiveFormsModule,SecureImageComponent],
  templateUrl: './conversation-detail.component.html',
  styleUrls: ['./conversation-detail.component.scss']
})
export class ConversationDetailComponent implements OnInit, OnDestroy {
  conversationId!: number;
  conversation: ConversationDetail | null = null;
  books: Book[] = [];
  
  messageForm: FormGroup;
  bookForm: FormGroup;
  
  showBookForm = false;
  loading = false;
  error = '';
  
  BookType = BookType;
  BookStatus = BookStatus;
  
  private statusCheckSubscription?: Subscription;
  
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
    this.loadConversation();
    this.loadBooks();
    
    // Set up polling for book status updates
    this.statusCheckSubscription = interval(5000).subscribe(() => {
      this.checkBookStatuses();
    });
  }
  
  ngOnDestroy(): void {
    if (this.statusCheckSubscription) {
      this.statusCheckSubscription.unsubscribe();
    }
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
          this.books = books;
        }
      });
  }
  
  checkBookStatuses(): void {
    const pendingBooks = this.books.filter(book => 
      book.status === BookStatus.PROCESSING || book.status === BookStatus.DRAFT
    );
  
    pendingBooks.forEach(book => {
      if (book.bookId) {
        this.bookService.getBookStatus(book.bookId).subscribe({
          next: response => {
            if (response.status !== book.status) {
              book.status = response.status;

            }
          }
        });
      }
    });
  }
  
  
  
  sendMessage(): void {
    if (this.messageForm.invalid) return;
    
    const content = this.messageForm.value.content;
    const role = "USER";
    this.loading = true;
    
    this.conversationService.addMessage(this.conversationId, { content, role })
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.loadConversation();
          this.messageForm.reset();
        },
        error: err => {
          this.error = 'Failed to send message';
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