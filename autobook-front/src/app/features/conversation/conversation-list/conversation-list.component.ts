import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConversationService } from '../../../core/services/conversation.service';
import { Conversation } from '../../../core/models/conversation.model';
import { CommonModule } from '@angular/common';
import { BookType, CreateBookRequest } from '../../../core/models/book.model';
import { BookService } from '../../../core/services/book.service';
import { map, switchMap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterLink,ReactiveFormsModule],
  templateUrl: './conversation-list.component.html',
  styleUrls: ['./conversation-list.component.scss']
})
export class ConversationListComponent implements OnInit {
  conversations: Conversation[] = [];
  newConversationForm: FormGroup;
  BookType = BookType; 

  showNewConversationForm = false;
  loading = false;
  error = '';
  
  constructor(
    private fb: FormBuilder,
    private conversationService: ConversationService,
    private bookService: BookService,

    private router: Router
  ) {
    this.newConversationForm = this.fb.group({
        title: ['', Validators.required],
        initialMessage: ['', Validators.required],
        bookType: [BookType.TEXT_IMAGE, Validators.required],
        stylePrompt: ['Fantasy, magical, colorful'],
        numChapters: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
        includeIllustrations: [true]
      });
  }
  
  ngOnInit(): void {
    this.loadConversations();
  }
  
  loadConversations(): void {
    this.loading = true;
    this.conversationService.getConversations()
      .subscribe({
        next: conversations => {
          this.conversations = conversations;
          this.loading = false;
        },
        error: err => {
          this.error = 'Failed to load conversations';
          console.error(err);
          this.loading = false;
        }
      });
  }
  
//   createConversation(): void {
//     if (this.newConversationForm.invalid) return;
    
//     this.loading = true;
//     this.conversationService.createConversation(this.newConversationForm.value)
//       .subscribe({
//         next: conversation => {
//           this.router.navigate(['/conversations', conversation.conversationId]);
//         },
//         error: err => {
//           this.error = 'Failed to create conversation';
//           console.error(err);
//           this.loading = false;
//         }
//       });
//   }
// createConversation(): void {
//     if (this.newConversationForm.invalid) return;

//     this.loading = true;
//     const formValue = this.newConversationForm.value;

//     this.conversationService.createConversation({
//       title: formValue.title,
//       initialMessage: formValue.initialMessage
//     }).pipe(
//       switchMap(conversation => {
//         const bookRequest: CreateBookRequest = {
//           title: formValue.title,
//           prompt: formValue.initialMessage,
//           conversationId: conversation.conversationId,
//           bookType: formValue.bookType,
//           stylePrompt: formValue.stylePrompt,
//           numChapters: formValue.numChapters,
//           includeIllustrations: formValue.includeIllustrations
//         };

//         return this.bookService.createBook(bookRequest).pipe(
//           map(() => conversation.conversationId)
//         );
//       })
//     ).subscribe({
//       next: (conversationId) => {
//         this.router.navigate(['/conversations', conversationId]);
//         this.loading = false;
//         this.toggleNewConversationForm();
//       },
//       error: (err) => {
//         this.error = 'Failed to create conversation';
//         console.error(err);
//         this.loading = false;
//       }
//     });
//   }
createConversation(): void {
    if (this.newConversationForm.invalid) return;
  
    this.loading = true;
    const formValue = this.newConversationForm.value;
  
    this.conversationService.createConversation({
      title: formValue.title,
      initialMessage: formValue.initialMessage
    }).pipe(
      switchMap(conversation => {
        const bookRequest: CreateBookRequest = {
          title: formValue.title,
          prompt: formValue.initialMessage,
          conversationId: conversation.conversationId,
          bookType: formValue.bookType,
          stylePrompt: formValue.stylePrompt,
          numChapters: formValue.numChapters,
          includeIllustrations: formValue.includeIllustrations
        };
  
        localStorage.setItem(
          `conversation-${conversation.conversationId}-bookParameters`,
          JSON.stringify({
            bookType: formValue.bookType,
            stylePrompt: formValue.stylePrompt,
            numChapters: formValue.numChapters,
            includeIllustrations: formValue.includeIllustrations
          })
        );
  
        return this.bookService.createBook(bookRequest).pipe(
          map(() => conversation)
        );
      })
    ).subscribe({
      next: (conversation) => {
        this.router.navigate(['/conversations', conversation.conversationId]);
        this.loading = false;
        this.toggleNewConversationForm();
      },
      error: (err) => {
        this.error = 'Failed to create conversation';
        console.error(err);
        this.loading = false;
      }
    });
  }
  
  
//   openConversation(id: number): void {
//     this.router.navigate(['/conversations', id]);
//   }
openConversation(id: number | undefined): void {
    if (id !== undefined) {
      this.router.navigate(['/conversations', id]);
    } else {
      console.error('Cannot open conversation: ID is undefined');
    }
  }
  
  deleteConversation(event: Event, id: number): void {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      this.conversationService.deleteConversation(id)
        .subscribe({
          next: () => {
            this.loadConversations();
          },
          error: err => {
            this.error = 'Failed to delete conversation';
            console.error(err);
          }
        });
    }
  }
  
  toggleNewConversationForm(): void {
    this.showNewConversationForm = !this.showNewConversationForm;
    if (!this.showNewConversationForm) {
      this.newConversationForm.reset();
    }
  }
}