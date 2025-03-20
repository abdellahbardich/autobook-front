import { Component, type OnInit, ViewChild, type ElementRef, inject, type AfterViewChecked } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { ActivatedRoute, Router, RouterLink } from "@angular/router"
import { BookService } from "../services/book.service"
import type { Book, BookConversation, BookMessage } from "../../../shared/models/book.model"

@Component({
  selector: "app-book-conversation",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="conversation-container">
      @if (isLoading) {
        <div class="loading">
          <p>Loading conversation...</p>
        </div>
      } @else if (!book) {
        <div class="not-found">
          <h2>Book Not Found</h2>
          <p>The book you're looking for doesn't exist or has been deleted.</p>
          <a routerLink="/books" class="btn-primary">Back to Books</a>
        </div>
      } @else {
        <div class="conversation-header">
          <div class="book-info">
            <h1>{{ book.title }}</h1>
            <div class="book-meta">
              <span class="book-type">{{ book.type === 'text-only' ? 'Text Only' : 'With Images' }}</span>
              <span class="book-status" [ngClass]="book.status">{{ book.status | titlecase }}</span>
            </div>
          </div>
          <a [routerLink]="['/books', book.id]" class="btn-back">Back to Book</a>
        </div>
        
        <div class="conversation-content">
          <div class="messages-container" #messagesContainer>
            @if (currentConversation && currentConversation.messages.length > 0) {
              @for (message of currentConversation.messages; track message.id) {
                <div class="message" [ngClass]="message.role">
                  <div class="message-content">
                    <p>{{ message.content }}</p>
                  </div>
                  <div class="message-time">
                    {{ message.createdAt | date:'short' }}
                  </div>
                </div>
              }
            } @else {
              <div class="empty-conversation">
                <p>Start a conversation about your book. Ask questions or request changes.</p>
              </div>
            }
            
            @if (isTyping) {
              <div class="message assistant typing">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            }
          </div>
          
          <div class="message-form">
            <form [formGroup]="messageForm" (ngSubmit)="sendMessage()">
              <div class="form-group">
                <textarea 
                  formControlName="content" 
                  placeholder="Type your message..."
                  rows="3"
                  [disabled]="isSending"
                ></textarea>
              </div>
              <button 
                type="submit" 
                class="btn-send" 
                [disabled]="messageForm.invalid || isSending"
              >
                {{ isSending ? 'Sending...' : 'Send' }}
              </button>
            </form>
          </div>
        </div>
        
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
      }
    </div>
  `,
  styles: [
    `
    .conversation-container {
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
    
    .conversation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .book-info h1 {
      font-size: 1.5rem;
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
    
    .btn-back {
      background-color: #ecf0f1;
      color: #7f8c8d;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      text-decoration: none;
      font-size: 0.9rem;
      transition: background-color 0.3s;
    }
    
    .btn-back:hover {
      background-color: #bdc3c7;
    }
    
    .conversation-content {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
      display: flex;
      flex-direction: column;
      height: 600px;
    }
    
    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .empty-conversation {
      text-align: center;
      color: #7f8c8d;
      margin: auto 0;
    }
    
    .message {
      max-width: 80%;
      padding: 1rem;
      border-radius: 8px;
      position: relative;
    }
    
    .message.user {
      align-self: flex-end;
      background-color: #3498db;
      color: white;
    }
    
    .message.assistant {
      align-self: flex-start;
      background-color: #f8f9fa;
      color: #2c3e50;
    }
    
    .message-content p {
      margin: 0;
      line-height: 1.5;
    }
    
    .message-time {
      font-size: 0.75rem;
      opacity: 0.7;
      margin-top: 0.5rem;
      text-align: right;
    }
    
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .typing-indicator span {
      width: 8px;
      height: 8px;
      background-color: #7f8c8d;
      border-radius: 50%;
      display: inline-block;
      animation: typing 1s infinite ease-in-out;
    }
    
    .typing-indicator span:nth-child(1) {
      animation-delay: 0s;
    }
    
    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes typing {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-5px);
      }
    }
    
    .message-form {
      padding: 1rem;
      border-top: 1px solid #ecf0f1;
    }
    
    .message-form form {
      display: flex;
      gap: 1rem;
    }
    
    .form-group {
      flex: 1;
    }
    
    textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      resize: none;
    }
    
    textarea:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
    
    .btn-send {
      background-color: #3498db;
      color: white;
      border: none;
      padding: 0 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
      align-self: flex-end;
    }
    
    .btn-send:hover {
      background-color: #2980b9;
    }
    
    .btn-send:disabled {
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
      .conversation-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .message {
        max-width: 90%;
      }
    }
  `,
  ],
})
export class BookConversationComponent implements OnInit, AfterViewChecked {
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private bookService = inject(BookService)
  private fb = inject(FormBuilder)

  @ViewChild("messagesContainer") messagesContainer!: ElementRef

  book: Book | null = null
  conversations: BookConversation[] = []
  currentConversation: BookConversation | null = null
  isLoading = true
  isSending = false
  isTyping = false

  messageForm: FormGroup = this.fb.group({
    content: ["", Validators.required],
  })

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

  ngAfterViewChecked(): void {
    this.scrollToBottom()
  }

  loadBook(id: string): void {
    this.bookService.getBook(id).subscribe({
      next: (book) => {
        this.book = book
        this.loadConversations(id)
      },
      error: () => {
        this.isLoading = false
        this.book = null
      },
    })
  }

  loadConversations(bookId: string): void {
    this.bookService.getBookConversations(bookId).subscribe({
      next: (conversations) => {
        this.conversations = conversations

        if (conversations.length > 0) {
          // Use the most recent conversation
          this.currentConversation = conversations[0]
        } else {
          // Create a placeholder for a new conversation
          this.currentConversation = {
            id: "new",
            bookId,
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        }

        this.isLoading = false
      },
      error: () => {
        this.isLoading = false
      },
    })
  }

  sendMessage(): void {
    if (this.messageForm.invalid || !this.book || !this.currentConversation) return

    const content = this.messageForm.value.content
    this.isSending = true

    // Optimistically add user message to UI
    const userMessage: BookMessage = {
      id: "temp-" + Date.now(),
      content,
      role: "user",
      bookId: this.book.id,
      createdAt: new Date().toISOString(),
    }

    if (this.currentConversation.messages) {
      this.currentConversation.messages = [...this.currentConversation.messages, userMessage]
    } else {
      this.currentConversation.messages = [userMessage]
    }

    this.messageForm.reset()
    this.scrollToBottom()

    // Show typing indicator
    this.isTyping = true

    // Send message to API
    this.bookService.sendMessage(this.book.id, this.currentConversation.id, content).subscribe({
      next: (message) => {
        // Replace temp message with real one
        if (this.currentConversation) {
          this.currentConversation.messages = this.currentConversation.messages.filter((m) => m.id !== userMessage.id)
          this.currentConversation.messages.push(message)
        }

        // Simulate assistant typing
        setTimeout(() => {
          this.isTyping = false

          // Simulate assistant response
          const assistantMessage: BookMessage = {
            id: "response-" + Date.now(),
            content: this.generateAssistantResponse(content),
            role: "assistant",
            bookId: this.book!.id,
            createdAt: new Date().toISOString(),
          }

          if (this.currentConversation) {
            this.currentConversation.messages.push(assistantMessage)
          }

          this.isSending = false
          this.scrollToBottom()
        }, 2000)
      },
      error: () => {
        this.isTyping = false
        this.isSending = false

        // Remove optimistic message on error
        if (this.currentConversation) {
          this.currentConversation.messages = this.currentConversation.messages.filter((m) => m.id !== userMessage.id)
        }
      },
    })
  }

  generateAssistantResponse(userMessage: string): string {
    // This is a placeholder. In a real app, this would come from the API
    const responses = [
      "I've updated your book based on your feedback.",
      "I'll make those changes to the content right away.",
      "Your book is looking great! I've added the sections you requested.",
      "I've adjusted the formatting as you suggested.",
      "The images have been generated and added to your book.",
      "I've made the text revisions you asked for.",
      "Your feedback has been incorporated into the latest version.",
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement
      element.scrollTop = element.scrollHeight
    }
  }
}

