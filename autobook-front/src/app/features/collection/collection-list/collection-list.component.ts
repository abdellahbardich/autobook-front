import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CollectionService } from '../../../core/services/collection.service';
import { Collection } from '../../../core/models/collection.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-collection-list',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterLink,ReactiveFormsModule],
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.scss']
})
export class CollectionListComponent implements OnInit {
  collections: Collection[] = [];
  collectionForm: FormGroup;
  
  showForm = false;
  loading = false;
  error = '';
  
  constructor(
    private fb: FormBuilder,
    private collectionService: CollectionService,
    private router: Router
  ) {
    this.collectionForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }
  
  ngOnInit(): void {
    this.loadCollections();
  }
  
  loadCollections(): void {
    this.loading = true;
    this.collectionService.getCollections()
      .subscribe({
        next: collections => {
          this.collections = collections;
          this.loading = false;
        },
        error: err => {
          this.error = 'Failed to load collections';
          console.error(err);
          this.loading = false;
        }
      });
  }
  
  createCollection(): void {
    if (this.collectionForm.invalid) return;
    
    this.loading = true;
    this.collectionService.createCollection(this.collectionForm.value)
      .subscribe({
        next: () => {
          this.loadCollections();
          this.collectionForm.reset();
          this.showForm = false;
        },
        error: err => {
          this.error = 'Failed to create collection';
          console.error(err);
          this.loading = false;
        }
      });
  }
  
  deleteCollection(event: Event, id: number): void {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      this.collectionService.deleteCollection(id)
        .subscribe({
          next: () => {
            this.loadCollections();
          },
          error: err => {
            this.error = 'Failed to delete collection';
            console.error(err);
          }
        });
    }
  }
  
  openCollection(id: number): void {
    this.router.navigate(['/collections', id]);
  }
  
  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.collectionForm.reset();
    }
  }
}