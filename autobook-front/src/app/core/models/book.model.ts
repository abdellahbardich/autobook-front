export enum BookType {
    TEXT_ONLY = 'TEXT_ONLY',
    IMAGE_ONLY = 'IMAGE_ONLY',
    TEXT_IMAGE = 'TEXT_IMAGE'
  }
  
  export enum BookStatus {
    DRAFT = 'DRAFT',
    PROCESSING = 'PROCESSING',
    COMPLETE = 'COMPLETE',
    FAILED = 'FAILED'
  }
  
  export interface Book {
    bookId: number;  
    title: string;
    summary?: string;
    style?: string;
    bookType?: BookType;
    status?: BookStatus;
    previewImageUrl?: string;
    downloadUrl?: string;
    coverImageUrl?: string;
    chapters?: Chapter[];
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface CreateBookRequest {
    conversationId: number;
    messageId?: number;
    prompt: string;
    title: string;
    bookType: BookType;
    stylePrompt?: string;
    numChapters?: number;
    includeIllustrations?: boolean;
  }
  
  export interface Chapter {
    chapterNumber: number;
    chapterTitle: string;
    chapterContent: string;
    illustrationPath?: string;
  }
  
  export interface BookDetail {
    id: number;
    conversationId: number;
    title: string;
    prompt: string;
    bookType: BookType;
    stylePrompt?: string;
    numChapters: number;
    includeIllustrations: boolean;
    status: BookStatus;
    coverImageUrl?: string;
    previewImageUrl?: string;
    chapters?: Chapter[];
    createdAt: Date;
    updatedAt: Date;
  }