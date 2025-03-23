import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookDetailComponent } from './book-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../../core/services/book.service';
import { CollectionService } from '../../../core/services/collection.service';
import { of } from 'rxjs';
import { BookStatus, BookType } from '../../../core/models/book.model';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-secure-image',
  template: '<img [src]="url" [alt]="alt" />'
})
class MockSecureImageComponent {
  @Input() url: string = '';
  @Input() alt: string = '';
  @Input() placeholderUrl: string = '';
}

describe('BookDetailComponent', () => {
  let component: BookDetailComponent;
  let fixture: ComponentFixture<BookDetailComponent>;
  let bookServiceSpy: jasmine.SpyObj<BookService>;
  let collectionServiceSpy: jasmine.SpyObj<CollectionService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockBookId = 1;
  const mockBook = {
    bookId: 1,
    title: 'Test Book',
    status: BookStatus.COMPLETE,
    bookType: BookType.TEXT_IMAGE,
    numChapters: 3,
    stylePrompt: 'Fantasy style',
    includeIllustrations: true,
    createdAt: new Date(),
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'Chapter 1',
        chapterContent: 'This is the content of chapter 1',
        illustrationPath: '/path/to/illustration1'
      }
    ]
  };

  const mockCollections = [
    { collectionId: 1, name: 'Collection 1' },
    { collectionId: 2, name: 'Collection 2' }
  ];

  beforeEach(async () => {
    bookServiceSpy = jasmine.createSpyObj('BookService', [
      'getBookById',
      'getBookStatus',
      'downloadBook',
      'deleteBook',
      'getBookCoverUrl'
    ]);
    collectionServiceSpy = jasmine.createSpyObj('CollectionService', [
      'getCollections',
      'addBookToCollection'
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: () => '1',
        },
      },
    };

    bookServiceSpy.getBookById.and.returnValue(of(mockBook as any));
    bookServiceSpy.getBookStatus.and.returnValue(of({ status: BookStatus.COMPLETE }));
    bookServiceSpy.getBookCoverUrl.and.returnValue('test-cover-url');
    collectionServiceSpy.getCollections.and.returnValue(of(mockCollections as any));
    collectionServiceSpy.addBookToCollection.and.returnValue(of({} as any));
    bookServiceSpy.deleteBook.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        HttpClientTestingModule,
        BookDetailComponent
      ],
      declarations: [
        MockSecureImageComponent
      ],
      providers: [
        { provide: BookService, useValue: bookServiceSpy },
        { provide: CollectionService, useValue: collectionServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookDetailComponent);
    component = fixture.componentInstance;
    
    component.bookId = mockBookId;
    
    spyOn(window, 'alert').and.stub();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load book and collections on init', () => {
    spyOn(component, 'loadBook');
    spyOn(component, 'loadCollections');
    
    component.ngOnInit();
    
    expect(component.bookId).toBe(mockBookId);
    expect(component.loadBook).toHaveBeenCalled();
    expect(component.loadCollections).toHaveBeenCalled();
  });

  it('should unsubscribe on destroy', () => {
    const subscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    component['statusCheckSubscription'] = subscription;
    
    component.ngOnDestroy();
    
    expect(subscription.unsubscribe).toHaveBeenCalled();
  });

  it('should load book details', () => {
    component.loadBook();
    
    expect(bookServiceSpy.getBookById).toHaveBeenCalledWith(mockBookId);
    expect(component.book).toEqual(mockBook as any);
    expect(component.loading).toBeFalse();
  });

  it('should load collections', () => {
    component.loadCollections();
    
    expect(collectionServiceSpy.getCollections).toHaveBeenCalled();
    expect(component.collections).toEqual(mockCollections as any);
  });

  it('should add book to collection', () => {
    component.selectedCollectionId = 1;
    component.bookId = mockBookId;
    
    component.addToCollection();
    
    expect(collectionServiceSpy.addBookToCollection).toHaveBeenCalledWith(1, mockBookId);
    expect(window.alert).toHaveBeenCalled();
    expect(component.selectedCollectionId).toBeNull();
  });

  it('should not add book to collection if no collection selected', () => {
    component.selectedCollectionId = null;
    
    component.addToCollection();
    
    expect(collectionServiceSpy.addBookToCollection).not.toHaveBeenCalled();
  });

  it('should navigate when going to conversation', () => {
    component.goToConversation();
    
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/conversations']);
  });

  it('should delete book after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    
    component.deleteBook();
    
    expect(bookServiceSpy.deleteBook).toHaveBeenCalledWith(mockBookId);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/conversations']);
  });

  it('should not delete book if not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    
    component.deleteBook();
    
    expect(bookServiceSpy.deleteBook).not.toHaveBeenCalled();
  });

  it('should return correct status badge class', () => {
    component.book = { status: BookStatus.COMPLETE } as any;
    expect(component.getStatusBadgeClass()).toBe('badge-success');
    
    component.book = { status: BookStatus.PROCESSING } as any;
    expect(component.getStatusBadgeClass()).toBe('badge-info');
    
    component.book = { status: BookStatus.DRAFT } as any;
    expect(component.getStatusBadgeClass()).toBe('badge-warning');
    
    component.book = { status: BookStatus.FAILED } as any;
    expect(component.getStatusBadgeClass()).toBe('badge-danger');
  });

  it('should return empty string for status badge class if no book', () => {
    component.book = null;
    expect(component.getStatusBadgeClass()).toBe('');
  });

  it('should get cover URL', () => {
    const url = component.getCoverUrl();
    
    expect(bookServiceSpy.getBookCoverUrl).toHaveBeenCalledWith(mockBookId);
    expect(url).toBe('test-cover-url');
  });

  it('should download book', () => {
    const mockBlob = new Blob(['test'], { type: 'application/pdf' });
    bookServiceSpy.downloadBook.and.returnValue(of(mockBlob));
    
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:url');
    spyOn(window.URL, 'revokeObjectURL');
    const mockAnchor = jasmine.createSpyObj('HTMLAnchorElement', ['click']);
    spyOn(document, 'createElement').and.returnValue(mockAnchor);
    spyOn(document.body, 'appendChild');
    
    component.book = mockBook as any;
    component.downloadBook();
    
    expect(bookServiceSpy.downloadBook).toHaveBeenCalledWith(mockBookId);
    expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(mockAnchor.download).toBe('Test Book.pdf');
    expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchor);
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:url');
  });

  it('should dismiss error', () => {
    component.error = 'Test error';
    component.dismissError();
    expect(component.error).toBeNull();
  });
});