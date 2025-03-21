import { Component, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { ConversationService } from "../../services/conversation.service"

@Component({
  selector: "app-conversation-new",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="new-conversation-container">
      <div class="new-conversation-card">
        <h1>Start a New Conversation</h1>
        
        <form [formGroup]="conversationForm" (ngSubmit)="createConversation()">
          <div class="form-group">
            <label for="title">Conversation Title (Optional)</label>
            <input 
              type="text" 
              id="title" 
              formControlName="title" 
              placeholder="E.g., Fantasy Novel, Science Textbook, etc."
            >
          </div>
          
          <div class="form-group">
            <label for="initialPrompt">Initial Prompt</label>
            <textarea 
              id="initialPrompt" 
              formControlName="initialPrompt" 
              placeholder="Describe the book you want to create..."
              rows="5"
            ></textarea>
            @if (initialPrompt?.invalid && (initialPrompt?.dirty || initialPrompt?.touched)) {
              <div class="error-message">
                @if (initialPrompt?.errors?.['required']) {
                  <span>Initial prompt is required</span>
                }
              </div>
            }
          </div>
          
          <div class="prompt-suggestions">
            <h3>Suggested Prompts:</h3>
            <div class="suggestions-grid">
              <button type="button" class="suggestion-item" (click)="usePrompt('Create a fantasy novel about a young wizard who discovers a hidden world of magic.')">
                Fantasy Novel
              </button>
              <button type="button" class="suggestion-item" (click)="usePrompt('Write a science textbook about the solar system for middle school students.')">
                Science Textbook
              </button>
              <button type="button" class="suggestion-item" (click)="usePrompt('Create a cookbook with 10 easy vegetarian recipes for beginners.')">
                Cookbook
              </button>
              <button type="button" class="suggestion-item" (click)="usePrompt('Write a business guide about starting an online store from scratch.')">
                Business Guide
              </button>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancel()">Cancel</button>
            <button 
              type="submit" 
              class="btn-create" 
              [disabled]="conversationForm.invalid || isCreating"
            >
              {{ isCreating ? 'Creating...' : 'Start Conversation' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
    .new-conversation-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .new-conversation-card {
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
    
    .prompt-suggestions {
      margin-bottom: 2rem;
    }
    
    .prompt-suggestions h3 {
      font-size: 1rem;
      color: #7f8c8d;
      margin-bottom: 0.75rem;
    }
    
    .suggestions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.75rem;
    }
    
    .suggestion-item {
      padding: 0.75rem;
      background-color: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      color: #2c3e50;
    }
    
    .suggestion-item:hover {
      background-color: #e9ecef;
      border-color: #dee2e6;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
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
      .suggestions-grid {
        grid-template-columns: 1fr;
      }
    }
    `,
  ],
})
export class ConversationNewComponent {
  private fb = inject(FormBuilder)
  private conversationService = inject(ConversationService)
  private router = inject(Router)

  conversationForm: FormGroup = this.fb.group({
    title: [""],
    initialPrompt: ["", Validators.required],
  })

  isCreating = false

  get initialPrompt() {
    return this.conversationForm.get("initialPrompt")
  }

  usePrompt(prompt: string): void {
    this.conversationForm.patchValue({ initialPrompt: prompt })
  }

  createConversation(): void {
    if (this.conversationForm.invalid) return

    this.isCreating = true
    const { title, initialPrompt } = this.conversationForm.value

    // First create the conversation
    this.conversationService.createConversation(title || "Untitled Conversation").subscribe({
      next: (conversation) => {
        // Then send the initial message
        this.conversationService.sendMessage(conversation.id, initialPrompt).subscribe({
          next: () => {
            this.router.navigate(["/books/conversations", conversation.id])
          },
          error: () => {
            this.isCreating = false
          },
        })
      },
      error: () => {
        this.isCreating = false
      },
    })
  }

  cancel(): void {
    this.router.navigate(["/books/conversations"])
  }
}

