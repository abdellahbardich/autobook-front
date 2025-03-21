import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConversationService } from '../../../core/services/conversation.service';
import { Conversation } from '../../../core/models/conversation.model';
import { CommonModule } from '@angular/common';

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
  
  showNewConversationForm = false;
  loading = false;
  error = '';
  
  constructor(
    private fb: FormBuilder,
    private conversationService: ConversationService,
    private router: Router
  ) {
    this.newConversationForm = this.fb.group({
      title: ['', Validators.required],
      initialMessage: ['', Validators.required]
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
  
  createConversation(): void {
    if (this.newConversationForm.invalid) return;
    
    this.loading = true;
    this.conversationService.createConversation(this.newConversationForm.value)
      .subscribe({
        next: conversation => {
          this.router.navigate(['/conversations', conversation.conversationId]);
        },
        error: err => {
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