import { Component, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { RouterLink } from "@angular/router"
import { BookService } from "../services/book.service"
import type { BookCollection } from "../../../shared/models/book.model"

@Component({
  selector: "app-collections",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="collections-container">
      <div class="collections-header">
        <h1>Book Collections</h1>
        <button class="btn-create" (click)="showCreateForm = true">Create Collection</button>
      </div>
      
      @if (isLoading) {
        <div class="loading">
          <p>Loading collections...</p>
        </div>
      } @else if (collections.length === 0) {
        <div class="empty-state">
          <h2>No Collections Yet</h2>
          <p>Create your first collection to organize your books</p>
          <button class="btn-primary" (click)="showCreateForm = true">Create Your First Collection</button>
        </div>
      } @else {
        <div class="collections-grid">
          @for (collection of collections; track collection.id) {
            <div class="collection-card">
              <h2>{{ collection.name }}</h2>
              <p>{{ collection.description || 'No description' }}</p>
              <div class="collection-meta">
                <span>{{ collection.books.length }} books</span>
                <span>Created {{ collection.createdAt | date:'mediumDate' }}</span>
              </div>
              <div class="collection-actions">
                <button class="btn-view">View Books</button>
                <button class="btn-edit" (click)="editCollection(collection)">Edit</button>
                <button class="btn-delete" (click)="deleteCollection(collection.id)">Delete</button>
              </div>
            </div>
          }
        </div>
      }
      
      @if (showCreateForm || showEditForm) {
        <div class="modal-overlay">
          <div class="modal-content">
            <h2>{{ showEditForm ? 'Edit' : 'Create' }} Collection</h2>
            <form [formGroup]="collectionForm" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label for="name">Collection Name</label>
                <input 
                  type="text" 
                  id="name" 
                  formControlName="name" 
                  placeholder="Enter collection name"
                >
                @if (name?.invalid && (name?.dirty || name?.touched)) {
                  <div class="error-message">
                    @if (name?.errors?.['required']) {
                      <span>Name is required</span>
                    }
                  </div>
                }
              </div>
              
              <div class="form-group">
                <label for="description">Description (Optional)</label>
                <textarea 
                  id="description" 
                  formControlName="description" 
                  placeholder="Enter collection description"
                  rows="3"
                ></textarea>
              </div>
              
              <div class="form-actions">
                <button type="button" class="btn-cancel" (click)="closeForm()">Cancel</button>
                <button 
                  type="submit" 
                  class="btn-save" 
                  [disabled]="collectionForm.invalid || isSubmitting"
                >
                  {{ isSubmitting ? 'Saving...' : (showEditForm ? 'Save Changes' : 'Create Collection') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
    .collections-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .collections-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    h1 {
      font-size: 2rem;
      color: #2c3e50;
      margin: 0;
    }
    
    .btn-create {
      background-color: #3498db;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-create:hover {
      background-color: #2980b9;
    }
    
    .loading, .empty-state {
      text-align: center;
      padding: 3rem;
      background-color: #f8f9fa;
      border-radius: 8px;
    }
    
    .empty-state h2 {
      font-size: 1.5rem;
      color: #2c3e50;
      margin-bottom: 1rem;
    }
    
    .empty-state p {
      color: #7f8c8d;
      margin-bottom: 2rem;
    }
    
    .btn-primary {
      background-color: #3498db;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-primary:hover {
      background-color: #2980b9;
    }
    
    .collections-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .collection-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .collection-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    }
    
    .collection-card h2 {
      font-size: 1.25rem;
      color: #2c3e50;
      margin: 0 0 0.5rem;
    }
    
    .collection-card p {
      color: #7f8c8d;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    
    .collection-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: #95a5a6;
      margin-bottom: 1rem;
    }
    
    .collection-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .collection-actions button {
      flex: 1;
      padding: 0.5rem;
      border-radius: 4px;
      border: none;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-view {
      background-color: #3498db;
      color: white;
    }
    
    .btn-view:hover {
      background-color: #2980b9;
    }
    
    .btn-edit {
      background-color: #f39c12;
      color: white;
    }
    
    .btn-edit:hover {
      background-color: #d35400;
    }
    
    .btn-delete {
      background-color: #e74c3c;
      color: white;
    }
    
    .btn-delete:hover {
      background-color: #c0392b;
    }
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal-content {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      padding: 2rem;
      width: 90%;
      max-width: 500px;
    }
    
    .modal-content h2 {
      font-size: 1.5rem;
      color: #2c3e50;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #2c3e50;
    }
    
    input, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    input:focus, textarea:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
    
    .error-message {
      color: #e74c3c;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
    
    .btn-cancel {
      background-color: #ecf0f1;
      color: #7f8c8d;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-cancel:hover {
      background-color: #bdc3c7;
    }
    
    .btn-save {
      background-color: #3498db;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-save:hover {
      background-color: #2980b9;
    }
    
    .btn-save:disabled {
      background-color: #95a5a6;
      cursor: not-allowed;
    }
  `,
  ],
})
export class CollectionsComponent implements OnInit {
  private bookService = inject(BookService)
  private fb = inject(FormBuilder)

  collections: BookCollection[] = []
  isLoading = true
  isSubmitting = false
  showCreateForm = false
  showEditForm = false
  currentCollectionId: string | null = null

  collectionForm: FormGroup = this.fb.group({
    name: ["", Validators.required],
    description: [""],
  })

  get name() {
    return this.collectionForm.get("name")
  }

  ngOnInit(): void {
    this.loadCollections()
  }

  loadCollections(): void {
    this.isLoading = true
    this.bookService.getCollections().subscribe({
      next: (collections) => {
        this.collections = collections
        this.isLoading = false
      },
      error: () => {
        this.isLoading = false
      },
    })
  }

  editCollection(collection: BookCollection): void {
    this.collectionForm.patchValue({
      name: collection.name,
      description: collection.description || "",
    })
    this.currentCollectionId = collection.id
    this.showEditForm = true
  }

  deleteCollection(id: string): void {
    if (confirm("Are you sure you want to delete this collection?")) {
      // In a real app, this would call an API endpoint
      this.collections = this.collections.filter((c) => c.id !== id)
    }
  }

  onSubmit(): void {
    if (this.collectionForm.invalid) return

    this.isSubmitting = true

    if (this.showEditForm && this.currentCollectionId) {
      // Update existing collection
      // In a real app, this would call an API endpoint
      const updatedCollection = {
        ...this.collections.find((c) => c.id === this.currentCollectionId),
        ...this.collectionForm.value,
      }

      this.collections = this.collections.map((c) => (c.id === this.currentCollectionId ? updatedCollection : c))

      setTimeout(() => {
        this.isSubmitting = false
        this.closeForm()
      }, 1000)
    } else {
      // Create new collection
      this.bookService.createCollection(this.collectionForm.value).subscribe({
        next: (newCollection) => {
          this.collections.push(newCollection)
          this.isSubmitting = false
          this.closeForm()
        },
        error: () => {
          this.isSubmitting = false
        },
      })
    }
  }

  closeForm(): void {
    this.showCreateForm = false
    this.showEditForm = false
    this.currentCollectionId = null
    this.collectionForm.reset()
  }
}

