export type BookType = 'TEXT_ONLY' | 'TEXT_IMAGE';
export type BookStatus = 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'FAILED';

export interface Book {
  id: number;
  title: string;
  description?: string;
  type: BookType;
  status: BookStatus;
  progress?: number;
  coverImage?: string;
  pdfUrl?: string;
  previewImages?: string[];
  conversationId?: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface BookCreationRequest {
  conversationId: number;
  messageId?: number;
  prompt: string;
  title: string;
  bookType: BookType;
  stylePrompt?: string;
  numChapters?: number;
  includeIllustrations?: boolean;
}

export interface BookConversation {
  id: number;
  title: string;
  messages: BookMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface BookMessage {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  bookId?: number;
  createdAt: string;
}

export interface BookCollection {
  id: number;
  name: string;
  description?: string;
  books: Book[];
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface CollectionCreateRequest {
  name: string;
  description?: string;
}

export interface ConversationCreateRequest {
  title: string;
  initialMessage?: string;
}