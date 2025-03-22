export interface Conversation {
  conversationId: number;  
  title: string;
  createdAt?: string;
  updatedAt?: string;
}
  
  export interface Message {
    id?: number;
    conversationId: number;
    content: string;
    sender: 'USER' | 'SYSTEM';
    createdAt?: Date;
  }
  
  export interface ConversationDetail {
    conversationId: number;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messages: Message[];
  }
  
  export interface CreateConversationRequest {
    title: string;
    initialMessage: string;
  }
  
  export interface AddMessageRequest {
    content: string;
    role: 'USER' | 'SYSTEM';
  }