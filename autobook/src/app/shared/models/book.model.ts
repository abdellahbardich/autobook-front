export type BookType = "text-only" | "with-images"
export type BookStatus = "draft" | "generating" | "completed" | "failed"

export interface Book {
  id: string
  title: string
  description: string
  type: BookType
  status: BookStatus
  progress: number
  coverImage?: string
  pdfUrl?: string
  previewImages?: string[]
  createdAt: string
  updatedAt: string
  userId: string
  collectionId?: string
}

export interface BookCollection {
  id: string
  name: string
  description?: string
  books: Book[]
  createdAt: string
  updatedAt: string
  userId: string
}

export interface BookMessage {
  id: string
  content: string
  role: "user" | "assistant"
  bookId: string
  createdAt: string
}

export interface BookConversation {
  id: string
  bookId: string
  messages: BookMessage[]
  createdAt: string
  updatedAt: string
}

