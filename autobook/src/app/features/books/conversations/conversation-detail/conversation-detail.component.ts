import { Component, type OnInit, ViewChild, type ElementRef, inject, type AfterViewChecked } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { ActivatedRoute, Router, RouterLink } from "@angular/router"
import { ConversationService } from "../../services/conversation.service"
import { BookService } from "../../services/book.service"
import type { BookConversation, BookMessage, Book } from "../../../../shared/models/book.model"

@Component({
  selector: "app-conversation-detail",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="conversation-container">
      <div class="conversation-sidebar">
        <div class="sidebar-header">
          <!-- <h2>{{ conversation?.title || 'Untitled Conversation' }}</h2> -->
          <div class="header-actions">
            <button class="btn-icon" title="New Conversation" routerLink="/books/conversations/new">
              <span class="icon">+</span>
            </button>
          </div>
        </div>
        
        <div class="sidebar-content">
          @if (generatedBooks.length > 0) {
            <div class="generated-books">
              <h3>Generated Books</h3>
              <ul class="book-list">
                @for (book of generatedBooks; track book.id) {
                  <li class="book-item">
                    <a [routerLink]="['/books', book.id]" class="book-link">
                      <span class="book-title">{{ book.title }}</span>
                      <span class="book-status" [ngClass]="book.status">{{ book.status }}</span>
                    </a>
                  </li>
                }
              </ul>
            </div>
          }
          
          <div class="actions-panel">
            <button class="btn-action" (click)="generateBook()" [disabled]="isGenerating">
              {{ isGenerating ? 'Generating...' : 'Generate Book' }}
            </button>
            <button class="btn-action secondary" (click)="clearConversation()">
              Clear Conversation
            </button>
          </div>
        </div>
      </div>
      
      <div class="conversation-main">
        <div class="messages-container" #messagesContainer>
          @if (!conversation || conversation.messages.length === 0) {
            <div class="empty-conversation">
              <h3>Start a new conversation</h3>
              <p>Describe the book you want to create and our AI will help you generate it.</p>
            </div>
          } @else {
            @for (message of conversation.messages; track message.id) {
              <div class="message" [ngClass]="message.role">
                <div class="message-avatar">
                  <div class="avatar">{{ message.role === 'user' ? 'U' : 'AI' }}</div>
                </div>
                <div class="message-content">
                  <div class="message-header">
                    <span class="message-sender">{{ message.role === 'user' ? 'You' : 'AI Assistant' }}</span>
                    <span class="message-time">{{ message.createdAt | date:'short' }}</span>
                  </div>
                  <div class="message-text">{{ message.content }}</div>
                </div>
              </div>
            }
          }
          
          @if (isTyping) {
            <div class="message assistant">
              <div class="message-avatar">
                <div class="avatar">AI</div>
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="message-sender">AI Assistant</span>
                </div>
                <div class="message-text typing">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>
              </div>
            </div>
          }
        </div>
        
        <div class="message-input">
          <form [formGroup]="messageForm" (ngSubmit)="sendMessage()">
            <textarea 
              formControlName="content" 
              placeholder="Type your message here..."
              rows="3"
              [disabled]="isSending"
            ></textarea>
            <div class="input-actions">
              <button 
                type="submit" 
                class="btn-send" 
                [disabled]="messageForm.invalid || isSending"
              >
                {{ isSending ? 'Sending...' : 'Send' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .conversation-container {
      display: flex;
      height: calc(100vh - 140px);
      max-width: 1600px;
      margin: 0 auto;
    }
    
    .conversation-sidebar {
      width: 300px;
      background-color: #f8f9fa;
      border-right: 1px solid #e9ecef;
      display: flex;
      flex-direction: column;
    }
    
    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .sidebar-header h2 {
      margin: 0;
      font-size: 1.2rem;
      color: #2c3e50;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .header-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .btn-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #3498db;
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-icon:hover {
      background-color: #2980b9;
    }
    
    .icon {
      font-size: 1.2rem;
      line-height: 1;
    }
    
    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
    }
    
    .generated-books {
      margin-bottom: 1.5rem;
    }
    
    .generated-books h3 {
      font-size: 1rem;
      color: #7f8c8d;
      margin-bottom: 0.5rem;
    }
    
    .book-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .book-item {
      margin-bottom: 0.5rem;
    }
    
    .book-link {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background-color: white;
      border-radius: 4px;
      text-decoration: none;
      transition: background-color 0.3s;
    }
    
    .book-link:hover {
      background-color: #ecf0f1;
    }
    
    .book-title {
      color: #2c3e50;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .book-status {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      text-transform: capitalize;
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
    
    .actions-panel {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .btn-action {
      padding: 0.75rem;
      border-radius: 4px;
      border: none;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-action:not(.secondary) {
      background-color: #3498db;
      color: white;
    }
    
    .btn-action:not(.secondary):hover {
      background-color: #2980b9;
    }
    
    .btn-action:not(.secondary):disabled {
      background-color: #95a5a6;
      cursor: not-allowed;
    }
    
    .btn-action.secondary {
      background-color: #ecf0f1;
      color: #7f8c8d;
    }
    
    .btn-action.secondary:hover {
      background-color: #bdc3c7;
    }
    
    .conversation-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: white;
    }
    
    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .empty-conversation {
      text-align: center;
      margin: auto 0;
      padding: 2rem;
      color: #7f8c8d;
    }
    
    .empty-conversation h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #2c3e50;
    }
    
    .message {
      display: flex;
      gap: 1rem;
      max-width: 80%;
    }
    
    .message.user {
      align-self: flex-end;
    }
    
    .message.assistant {
      align-self: flex-start;
    }
    
    .message-avatar {
      flex-shrink: 0;
    }
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
    }
    
    .message.user .avatar {
      background-color: #3498db;
    }
    
    .message.assistant .avatar {
      background-color: #9b59b6;
    }
    
    .message-content {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .message.user .message-content {
      background-color: #3498db;
      color: white;
    }
    
    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
    }
    
    .message.user .message-header {
      color: rgba(255, 255, 255, 0.8);
    }
    
    .message-text {
      line-height: 1.5;
    }
    
    .typing {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      height: 1.5rem;
    }
    
    .dot {
      width: 8px;
      height: 8px;
      background-color: #7f8c8d;
      border-radius: 50%;
      animation: pulse 1.5s infinite ease-in-out;
    }
    
    .dot:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .dot:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.5;
      }
    }
    
    .message-input {
      border-top: 1px solid #e9ecef;
      padding: 1rem;
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
    
    .input-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 0.5rem;
    }
    
    .btn-send {
      background-color: #3498db;
      color: white;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-send:hover {
      background-color: #2980b9;
    }
    
    .btn-send:disabled {
      background-color: #95a5a6;
      cursor: not-allowed;
    }
    
    @media (max-width: 768px) {
      .conversation-container {
        flex-direction: column;
        height: auto;
      }
      
      .conversation-sidebar {
        width: 100%;
        height: auto;
        border-right: none;
        border-bottom: 1px solid #e9ecef;
      }
      
      .conversation-main {
        height: 70vh;
      }
    }
    `,
  ],
})
export class ConversationDetailComponent implements OnInit, AfterViewChecked {
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private conversationService = inject(ConversationService)
  private bookService = inject(BookService)
  private fb = inject(FormBuilder)

  @ViewChild("messagesContainer") messagesContainer!: ElementRef

  conversation: BookConversation | null = null
  generatedBooks: Book[] = []
  isLoading = true
  isSending = false
  isTyping = false
  isGenerating = false

  messageForm: FormGroup = this.fb.group({
    content: ["", Validators.required],
  })

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get("id")
      if (id) {
        this.loadConversation(id)
      } else {
        this.router.navigate(["/books/conversations"])
      }
    })
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom()
  }

  loadConversation(id: string): void {
    this.isLoading = true
    this.conversationService.getConversation(id).subscribe({
      next: (conversation) => {
        this.conversation = conversation
        this.isLoading = false
        this.loadGeneratedBooks(id)
      },
      error: () => {
        this.isLoading = false
        this.router.navigate(["/books/conversations"])
      },
    })
  }

  loadGeneratedBooks(conversationId: string): void {
    // In a real app, you would fetch books associated with this conversation
    this.bookService.getBooks().subscribe({
      next: (books) => {
        // Filter books that were generated from this conversation
        this.generatedBooks = books.filter((book) => book.id.includes(conversationId))
      },
    })
  }

  sendMessage(): void {
    if (this.messageForm.invalid || !this.conversation) return

    const content = this.messageForm.value.content
    this.isSending = true

    // Add user message to UI immediately for better UX
    const tempUserMessage: BookMessage = {
      id: `temp-${Date.now()}`,
      content,
      role: "user",
      bookId: "",
      createdAt: new Date().toISOString(),
    }

    if (this.conversation) {
      this.conversation.messages = [...this.conversation.messages, tempUserMessage]
    }

    this.messageForm.reset()
    this.scrollToBottom()

    // Show typing indicator
    this.isTyping = true

    // Send message to API
    this.conversationService.sendMessage(this.conversation.id, content).subscribe({
      next: (message) => {
        // Replace temp message with real one from API
        if (this.conversation) {
          this.conversation.messages = this.conversation.messages.filter((m) => m.id !== tempUserMessage.id)
          this.conversation.messages.push(message)
        }

        // Simulate AI response
        setTimeout(() => {
          this.isTyping = false

          // Add AI response
          const aiResponse: BookMessage = {
            id: `ai-${Date.now()}`,
            content: this.generateAIResponse(content),
            role: "assistant",
            bookId: "",
            createdAt: new Date().toISOString(),
          }

          if (this.conversation) {
            this.conversation.messages.push(aiResponse)
          }

          this.isSending = false
          this.scrollToBottom()
        }, 1500)
      },
      error: () => {
        this.isTyping = false
        this.isSending = false

        // Remove temp message on error
        if (this.conversation) {
          this.conversation.messages = this.conversation.messages.filter((m) => m.id !== tempUserMessage.id)
        }
      },
    })
  }

  generateAIResponse(userMessage: string): string {
    // This is a placeholder. In a real app, this would come from the API
    const responses = [
      "I understand what you're looking for. Let me help you create that book.",
      "That's a great idea for a book! I can help you develop this concept further.",
      "I've noted your requirements. Would you like me to suggest some chapter ideas?",
      "I can definitely help with that. Let me know if you want to focus on any specific aspects.",
      "That sounds interesting! I'll help you create a book with those elements.",
      "I've processed your request. Would you like me to generate a sample chapter?",
      "I can create that for you. Would you like to include any specific themes or characters?",
      "Great concept! I'll help you develop this into a complete book.",
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  generateBook(): void {
    if (!this.conversation) return

    this.isGenerating = true

    this.conversationService.generateBookFromConversation(this.conversation.id).subscribe({
      next: (response) => {
        // In a real app, this would return the generated book or start the generation process
        setTimeout(() => {
          this.isGenerating = false

          // Simulate a new book being created
          const newBook: Book = {
            id: `book-${Date.now()}`,
            title: `Book from conversation ${this.conversation?.id.substring(0, 5)}`,
            description: "Generated from conversation with AI",
            type: "text-only",
            status: "generating",
            progress: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: "user123",
          }

          this.generatedBooks.push(newBook)
        }, 2000)
      },
      error: () => {
        this.isGenerating = false
      },
    })
  }

  clearConversation(): void {
    if (!this.conversation) return

    if (confirm("Are you sure you want to clear this conversation? This cannot be undone.")) {
      if (this.conversation) {
        this.conversation.messages = []
      }
    }
  }

  scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement
      element.scrollTop = element.scrollHeight
    }
  }
}

