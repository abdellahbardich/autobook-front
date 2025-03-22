import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionDetailComponent } from './collection-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CollectionService } from '../../../core/services/collection.service';
import { BookService } from '../../../core/services/book.service';
import { of } from 'rxjs';
import { BookStatus } from '../../../core/models/book.model';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';

// Mock SecureImageComponent
@Component({
  selector: 'app-secure-image',
  template: '<img [src]="url" [alt]="alt" />'
})
class MockSecureImageComponent {
  @Input() url: string = '';
  @Input() alt: string = '';
  @Input() placeholderUrl: string = '';
}

describe('CollectionDetailComponent', () => {
  let component: CollectionDetailComponent;
  let fixture: ComponentFixture<CollectionDetailComponent>;
  let collectionServiceSpy: jasmine.SpyObj<CollectionService>;
  let bookServiceSpy: jasmine.SpyObj<BookService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockCollectionId = 1;
  const mockCollection = {
    collectionId: 1,
    name: 'Test Collection',
    description: 'Test Description',
    books: [
      {
        bookId: 1,
        title: 'Test Book',
        status: BookStatus.COMPLETE,
        createdAt: new Date()
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    collectionServiceSpy = jasmine.createSpyObj('CollectionService', [
      'getCollectionDetails', 
      'updateCollection', 
      'removeBookFromCollection'
    ]);
    bookServiceSpy = jasmine.createSpyObj('BookService', ['getBookCoverUrl']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: () => '1',
        },
      },
    };

    collectionServiceSpy.getCollectionDetails.and.returnValue(of(mockCollection as any));
    collectionServiceSpy.updateCollection.and.returnValue(of({} as any));
    collectionServiceSpy.removeBookFromCollection.and.returnValue(of({} as any));
    bookServiceSpy.getBookCoverUrl.and.returnValue('test-cover-url');

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        CommonModule,
        HttpClientTestingModule,
        CollectionDetailComponent
      ],
      declarations: [
        MockSecureImageComponent
      ],
      providers: [
        FormBuilder,
        { provide: CollectionService, useValue: collectionServiceSpy },
        { provide: BookService, useValue: bookServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionDetailComponent);
    component = fixture.componentInstance;
    
    // Explicitly set the collection ID
    component.collectionId = mockCollectionId;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the edit form', () => {
    expect(component.editForm).toBeDefined();
    expect(component.editForm.get('name')).toBeDefined();
    expect(component.editForm.get('description')).toBeDefined();
  });

  it('should load collection on init', () => {
    spyOn(component, 'loadCollection');
    
    component.ngOnInit();
    
    expect(component.collectionId).toBe(mockCollectionId);
    expect(component.loadCollection).toHaveBeenCalled();
  });

  it('should load collection details', () => {
    component.loadCollection();
    
    expect(collectionServiceSpy.getCollectionDetails).toHaveBeenCalledWith(mockCollectionId);
    expect(component.collection).toEqual(mockCollection as any);
    expect(component.books).toEqual(mockCollection.books as any);
    expect(component.loading).toBeFalse();
  });

  it('should toggle edit mode', () => {
    component.collection = mockCollection as any;
    expect(component.isEditing).toBeFalse();
    
    component.toggleEditMode();
    
    expect(component.isEditing).toBeTrue();
    
    component.toggleEditMode();
    
    expect(component.isEditing).toBeFalse();
    expect(component.editForm.value.name).toBe(mockCollection.name);
    expect(component.editForm.value.description).toBe(mockCollection.description);
  });

  it('should not update collection if form is invalid', () => {
    component.editForm.setErrors({ 'invalid': true });
    component.updateCollection();
    
    expect(collectionServiceSpy.updateCollection).not.toHaveBeenCalled();
  });

  it('should update collection', () => {
    spyOn(component, 'loadCollection');
    component.editForm.setValue({
      name: 'Updated Name',
      description: 'Updated Description'
    });
    
    component.updateCollection();
    
    expect(collectionServiceSpy.updateCollection).toHaveBeenCalledWith(
      mockCollectionId, 
      { name: 'Updated Name', description: 'Updated Description' }
    );
    expect(component.loadCollection).toHaveBeenCalled();
    expect(component.isEditing).toBeFalse();
  });

  it('should remove book from collection', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.books = mockCollection.books as any;
    const bookId = 1;
    
    component.removeBook(bookId);
    
    expect(collectionServiceSpy.removeBookFromCollection).toHaveBeenCalledWith(
      mockCollectionId, 
      bookId
    );
    expect(component.books.length).toBe(0);
  });

  it('should not remove book if not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    
    component.removeBook(1);
    
    expect(collectionServiceSpy.removeBookFromCollection).not.toHaveBeenCalled();
  });

  it('should navigate to book details', () => {
    component.viewBook(1);
    
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/books', 1]);
  });

  it('should get book cover URL', () => {
    const url = component.getBookCoverUrl(1);
    
    expect(bookServiceSpy.getBookCoverUrl).toHaveBeenCalledWith(1);
    expect(url).toBe('test-cover-url');
  });

  it('should handle undefined book ID when getting cover URL', () => {
    const url = component.getBookCoverUrl(undefined);
    
    expect(url).toBe('assets/images/placeholder-cover.jpg');
    expect(bookServiceSpy.getBookCoverUrl).not.toHaveBeenCalled();
  });

  it('should return completed book count', () => {
    component.books = [
      { bookId: 1, status: BookStatus.COMPLETE },
      { bookId: 2, status: BookStatus.DRAFT },
      { bookId: 3, status: BookStatus.COMPLETE },
    ] as any;
    
    const count = component.getCompletedCount();
    
    expect(count).toBe(2);
  });

  it('should return pending book count', () => {
    component.books = [
      { bookId: 1, status: BookStatus.COMPLETE },
      { bookId: 2, status: BookStatus.DRAFT },
      { bookId: 3, status: BookStatus.PROCESSING },
    ] as any;
    
    const count = component.getPendingCount();
    
    expect(count).toBe(2);
  });
});