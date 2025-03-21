import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversation, ConversationDetail, CreateConversationRequest, Message, AddMessageRequest } from '../models/conversation.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private apiUrl = `${environment.apiUrl}/api/conversations`;
  
  constructor(private http: HttpClient) { }
  
  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(this.apiUrl);
  }
  
  getConversationDetails(id: number): Observable<ConversationDetail> {
    return this.http.get<ConversationDetail>(`${this.apiUrl}/${id}`);
  }
  
  createConversation(request: CreateConversationRequest): Observable<Conversation> {
    return this.http.post<Conversation>(this.apiUrl, request);
  }
  
  addMessage(conversationId: number, message: AddMessageRequest): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/${conversationId}/messages`, message);
  }
  
  deleteConversation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}