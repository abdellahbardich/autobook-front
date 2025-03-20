import { Injectable, computed, inject, signal } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { type Observable, catchError, of, tap } from "rxjs"
import { environment } from "../../../../environments/environment"
import type { Book, BookCollection, BookConversation, BookMessage } from "../../../shared/models/book.model"
import { ToastService } from "../../../shared/services/toast.service"

@Injectable({
  providedIn: "root",
})
export class BookService {
  private readonly API_URL = `${environment.apiUrl}/books`
  private http = inject(HttpClient)
  private toastService = inject(ToastService)

  // State management with signals
  private books = signal<Book[]>([])
  private collections = signal<BookCollection[]>([])
  private currentBook = signal<Book | null>(null)
  private conversations = signal<BookConversation[]>([])

  // Computed values
  public currentBookTitle = computed(() => this.currentBook()?.title || null)
  public booksByStatus = computed(() => {
    const allBooks = this.books()
    return {
      draft: allBooks.filter((book) => book.status === "draft"),
      generating: allBooks.filter((book) => book.status === "generating"),
      completed: allBooks.filter((book) => book.status === "completed"),
      failed: allBooks.filter((book) => book.status === "failed"),
    }
  })

  // Book CRUD operations
  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.API_URL).pipe(
      tap((books) => this.books.set(books)),
      catchError((error) => {
        this.toastService.show("Failed to load books", "error")
        return of([])
      }),
    )
  }

  getBook(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.API_URL}/${id}`).pipe(
      tap((book) => this.currentBook.set(book)),
      catchError((error) => {
        this.toastService.show(`Failed to load book: ${error.error.message}`, "error")
        throw error
      }),
    )
  }

  createBook(bookData: Partial<Book>): Observable<Book> {
    return this.http.post<Book>(this.API_URL, bookData).pipe(
      tap((newBook) => {
        this.books.update((books) => [...books, newBook])
        this.currentBook.set(newBook)
        this.toastService.show("Book created successfully", "success")
      }),
      catchError((error) => {
        this.toastService.show(`Failed to create book: ${error.error.message}`, "error")
        throw error
      }),
    )
  }

  updateBook(id: string, bookData: Partial<Book>): Observable<Book> {
    return this.http.put<Book>(`${this.API_URL}/${id}`, bookData).pipe(
      tap((updatedBook) => {
        this.books.update((books) => books.map((book) => (book.id === id ? updatedBook : book)))

        if (this.currentBook()?.id === id) {
          this.currentBook.set(updatedBook)
        }

        this.toastService.show("Book updated successfully", "success")
      }),
      catchError((error) => {
        this.toastService.show(`Failed to update book: ${error.error.message}`, "error")
        throw error
      }),
    )
  }

  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.books.update((books) => books.filter((book) => book.id !== id))

        if (this.currentBook()?.id === id) {
          this.currentBook.set(null)
        }

        this.toastService.show("Book deleted successfully", "success")
      }),
      catchError((error) => {
        this.toastService.show(`Failed to delete book: ${error.error.message}`, "error")
        throw error
      }),
    )
  }

  // Book generation
  generateBook(id: string, prompt: string): Observable<Book> {
    return this.http.post<Book>(`${this.API_URL}/${id}/generate`, { prompt }).pipe(
      tap((book) => {
        this.books.update((books) => books.map((b) => (b.id === id ? book : b)))

        if (this.currentBook()?.id === id) {
          this.currentBook.set(book)
        }

        this.toastService.show("Book generation started", "info")
      }),
      catchError((error) => {
        this.toastService.show(`Failed to start generation: ${error.error.message}`, "error")
        throw error
      }),
    )
  }

  getBookProgress(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.API_URL}/${id}/progress`).pipe(
      tap((book) => {
        this.books.update((books) => books.map((b) => (b.id === id ? book : b)))

        if (this.currentBook()?.id === id) {
          this.currentBook.set(book)
        }
      }),
      catchError((error) => {
        console.error("Failed to get book progress", error)
        return of(this.currentBook() as Book)
      }),
    )
  }

  // Collections
  getCollections(): Observable<BookCollection[]> {
    return this.http.get<BookCollection[]>(`${this.API_URL}/collections`).pipe(
      tap((collections) => this.collections.set(collections)),
      catchError((error) => {
        this.toastService.show("Failed to load collections", "error")
        return of([])
      }),
    )
  }

  createCollection(data: Partial<BookCollection>): Observable<BookCollection> {
    return this.http.post<BookCollection>(`${this.API_URL}/collections`, data).pipe(
      tap((newCollection) => {
        this.collections.update((collections) => [...collections, newCollection])
        this.toastService.show("Collection created successfully", "success")
      }),
      catchError((error) => {
        this.toastService.show(`Failed to create collection: ${error.error.message}`, "error")
        throw error
      }),
    )
  }

  // Conversations
  getBookConversations(bookId: string): Observable<BookConversation[]> {
    return this.http.get<BookConversation[]>(`${this.API_URL}/${bookId}/conversations`).pipe(
      tap((conversations) => this.conversations.set(conversations)),
      catchError((error) => {
        this.toastService.show("Failed to load conversations", "error")
        return of([])
      }),
    )
  }

  sendMessage(bookId: string, conversationId: string, content: string): Observable<BookMessage> {
    return this.http
      .post<BookMessage>(`${this.API_URL}/${bookId}/conversations/${conversationId}/messages`, { content })
      .pipe(
        tap((message) => {
          this.conversations.update((conversations) =>
            conversations.map((conv) => {
              if (conv.id === conversationId) {
                return {
                  ...conv,
                  messages: [...conv.messages, message],
                }
              }
              return conv
            }),
          )
        }),
        catchError((error) => {
          this.toastService.show(`Failed to send message: ${error.error.message}`, "error")
          throw error
        }),
      )
  }

  // PDF operations
  downloadPdf(bookId: string): Observable<Blob> {
    return this.http
      .get(`${this.API_URL}/${bookId}/pdf`, {
        responseType: "blob",
      })
      .pipe(
        catchError((error) => {
          this.toastService.show("Failed to download PDF", "error")
          throw error
        }),
      )
  }

  // Utility methods
  setCurrentBook(book: Book | null): void {
    this.currentBook.set(book)
  }

  getCurrentBook(): Book | null {
    return this.currentBook()
  }

  getAllBooks(): Book[] {
    return this.books()
  }

  getAllCollections(): BookCollection[] {
    return this.collections()
  }

  getAllConversations(): BookConversation[] {
    return this.conversations()
  }
}

