import { Book } from './book.model';

export interface Collection {
  collectionId?: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CollectionDetail {
  collectionId: number;
  name: string;
  description?: string;
  books: Book[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCollectionRequest {
  name: string;
  description?: string;
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
}