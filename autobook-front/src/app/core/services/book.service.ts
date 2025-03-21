import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book, BookDetail, CreateBookRequest, BookStatus } from '../models/book.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = `${environment.apiUrl}/api/books`;
  
  constructor(private http: HttpClient) { }
  
  createBook(request: CreateBookRequest): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, request);
  }
  
  getBookById(id: number): Observable<BookDetail> {
    return this.http.get<BookDetail>(`${this.apiUrl}/${id}`);
  }
  
  getBooksInConversation(conversationId: number): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/conversation/${conversationId}`);
  }
  
  getBookStatus(id: number): Observable<{ status: BookStatus }> {
    return this.http.get<{ status: BookStatus }>(`${this.apiUrl}/${id}/status`);
  }
  
  downloadBook(bookId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${bookId}/download`, {
      responseType: 'blob'
    });
  }
  
  getBookPreviewImage(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/preview`, {
      responseType: 'blob'
    });
  }
  
  getBookCoverImage(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/cover`, {
      responseType: 'blob'
    });
  }
  
  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  getBookCoverUrl(bookId: number): string {
    return `${this.apiUrl}/${bookId}/cover`;
  }
  
  getBookPreviewUrl(id: number): string {
    return `${environment.apiUrl}/api/books/${id}/preview`;
  }
}