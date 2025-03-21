import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Collection, CollectionDetail, CreateCollectionRequest, UpdateCollectionRequest } from '../models/collection.model';
import { Book } from '../models/book.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private apiUrl = `${environment.apiUrl}/api/collections`;
  
  constructor(private http: HttpClient) { }
  
  getCollections(): Observable<Collection[]> {
    return this.http.get<Collection[]>(this.apiUrl);
  }
  
  getCollectionDetails(id: number): Observable<CollectionDetail> {
    return this.http.get<CollectionDetail>(`${this.apiUrl}/${id}`);
  }
  
  createCollection(request: CreateCollectionRequest): Observable<Collection> {
    return this.http.post<Collection>(this.apiUrl, request);
  }
  
  updateCollection(id: number, request: UpdateCollectionRequest): Observable<Collection> {
    return this.http.put<Collection>(`${this.apiUrl}/${id}`, request);
  }
  
  deleteCollection(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  getBooksInCollection(collectionId: number): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/${collectionId}/books`);
  }
  
  addBookToCollection(collectionId: number, bookId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${collectionId}/books/${bookId}`, {});
  }
  
  removeBookFromCollection(collectionId: number, bookId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${collectionId}/books/${bookId}`);
  }
}