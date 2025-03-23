import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ConversationListComponent } from './conversation-list.component';
import { ConversationService } from '../../../core/services/conversation.service';
import { BookService } from '../../../core/services/book.service';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { BookType } from '../../../core/models/book.model';
import { Conversation } from '../../../core/models/conversation.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ConversationListComponent', () => {
  let component: ConversationListComponent;
  let fixture: ComponentFixture<ConversationListComponent>;
  let conversationServiceSpy: jasmine.SpyObj<ConversationService>;
  let bookServiceSpy: jasmine.SpyObj<BookService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let formBuilder: FormBuilder;

  const mockConversations: Conversation[] = [
    {
      conversationId: 1,
      title: 'Test Conversation 1',
      createdAt: '2023-01-01T10:00:00Z',
      updatedAt: '2023-01-01T10:30:00Z'
    },
    {
      conversationId: 2,
      title: 'Test Conversation 2',
      createdAt: '2023-01-02T15:00:00Z',
      updatedAt: '2023-01-02T15:45:00Z'
    }
  ];

  beforeEach(async () => {
    conversationServiceSpy = jasmine.createSpyObj('ConversationService', 
      ['getConversations', 'createConversation', 'deleteConversation']);
    bookServiceSpy = jasmine.createSpyObj('BookService', ['createBook']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    await TestBed.configureTestingModule({
      imports: [
        ConversationListComponent,
        ReactiveFormsModule,
        CommonModule
      ],
      providers: [
        FormBuilder,
        { provide: ConversationService, useValue: conversationServiceSpy },
        { provide: BookService, useValue: bookServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationListComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);
  });

  it('should create', () => {
    conversationServiceSpy.getConversations.and.returnValue(of(mockConversations));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    conversationServiceSpy.getConversations.and.returnValue(of(mockConversations));
    fixture.detectChanges();
    
    expect(component.newConversationForm.get('title')?.value).toBe('');
    expect(component.newConversationForm.get('initialMessage')?.value).toBe('');
    expect(component.newConversationForm.get('bookType')?.value).toBe(BookType.TEXT_IMAGE);
    expect(component.newConversationForm.get('stylePrompt')?.value).toBe('Fantasy, magical, colorful');
    expect(component.newConversationForm.get('numChapters')?.value).toBe(3);
    expect(component.newConversationForm.get('includeIllustrations')?.value).toBeTrue();
  });

  it('should call loadConversations on initialization', () => {
    conversationServiceSpy.getConversations.and.returnValue(of(mockConversations));
    spyOn(component, 'loadConversations');
    fixture.detectChanges();
    expect(component.loadConversations).toHaveBeenCalled();
  });

  it('should load conversations from the service', () => {
    conversationServiceSpy.getConversations.and.returnValue(of(mockConversations));
    
    component.loadConversations();
    
    expect(conversationServiceSpy.getConversations).toHaveBeenCalled();
    expect(component.conversations).toEqual(mockConversations);
    expect(component.loading).toBeFalse();
  });

  it('should handle error when loading conversations', () => {
    const errorMessage = 'Failed to load conversations';
    conversationServiceSpy.getConversations.and.returnValue(throwError(() => new Error(errorMessage)));
    
    component.loadConversations();
    
    expect(conversationServiceSpy.getConversations).toHaveBeenCalled();
    expect(component.error).toBe('Failed to load conversations');
    expect(component.loading).toBeFalse();
  });

  it('should toggle new conversation form visibility', () => {
    conversationServiceSpy.getConversations.and.returnValue(of(mockConversations));
    fixture.detectChanges();
    
    expect(component.showNewConversationForm).toBeFalse();
    
    component.toggleNewConversationForm();
    expect(component.showNewConversationForm).toBeTrue();
    
    component.toggleNewConversationForm();
    expect(component.showNewConversationForm).toBeFalse();
  });

  it('should reset form when closing new conversation form', () => {
    conversationServiceSpy.getConversations.and.returnValue(of(mockConversations));
    fixture.detectChanges();
    
    spyOn(component.newConversationForm, 'reset');
    
    component.toggleNewConversationForm();
    expect(component.showNewConversationForm).toBeTrue();
    
    component.toggleNewConversationForm();
    expect(component.showNewConversationForm).toBeFalse();
    expect(component.newConversationForm.reset).toHaveBeenCalled();
  });

  it('should open conversation with router navigate', () => {
    conversationServiceSpy.getConversations.and.returnValue(of(mockConversations));
    fixture.detectChanges();
    
    const conversationId = 1;
    component.openConversation(conversationId);
    
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/conversations', conversationId]);
  });

  it('should handle undefined conversationId in openConversation', () => {
    conversationServiceSpy.getConversations.and.returnValue(of(mockConversations));
    fixture.detectChanges();
    
    spyOn(console, 'error');
    component.openConversation(undefined);
    
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Cannot open conversation: ID is undefined');
  });

  it('should delete conversation after confirmation', () => {
    conversationServiceSpy.getConversations.and.returnValue(of(mockConversations));
    conversationServiceSpy.deleteConversation.and.returnValue(of(void 0));
    fixture.detectChanges();
    
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component, 'loadConversations');
    
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');
    component.deleteConversation(event, 1);
    
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(window.confirm).toHaveBeenCalled();
    expect(conversationServiceSpy.deleteConversation).toHaveBeenCalledWith(1);
    expect(component.loadConversations).toHaveBeenCalled();
  });

  it('should not delete conversation if not confirmed', () => {
    conversationServiceSpy.getConversations.and.returnValue(of(mockConversations));
    fixture.detectChanges();
    
    spyOn(window, 'confirm').and.returnValue(false);
    
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');
    component.deleteConversation(event, 1);
    
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(window.confirm).toHaveBeenCalled();
    expect(conversationServiceSpy.deleteConversation).not.toHaveBeenCalled();
  });

  it('should handle error when deleting conversation', () => {
    conversationServiceSpy.getConversations.and.returnValue(of(mockConversations));
    conversationServiceSpy.deleteConversation.and.returnValue(
      throwError(() => new Error('Failed to delete'))
    );
    fixture.detectChanges();
    
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(console, 'error');
    
    const event = new MouseEvent('click');
    component.deleteConversation(event, 1);
    
    expect(component.error).toBe('Failed to delete conversation');
    expect(console.error).toHaveBeenCalled();
  });

  

  it('should not create conversation if form is invalid', () => {
    conversationServiceSpy.getConversations.and.returnValue(of(mockConversations));
    fixture.detectChanges();
    
    component.newConversationForm.get('title')?.setValue('');
    component.newConversationForm.get('initialMessage')?.setValue('');
    
    component.createConversation();
    
    expect(conversationServiceSpy.createConversation).not.toHaveBeenCalled();
  });

  it('should handle error when creating conversation', fakeAsync(() => {
    conversationServiceSpy.getConversations.and.returnValue(of(mockConversations));
    fixture.detectChanges();
    
    component.newConversationForm.setValue({
      title: 'New Conversation',
      initialMessage: 'Hello, this is a test',
      bookType: BookType.TEXT_IMAGE,
      stylePrompt: 'Fantasy style',
      numChapters: 5,
      includeIllustrations: true
    });
    
    conversationServiceSpy.createConversation.and.returnValue(
      throwError(() => new Error('Failed to create conversation'))
    );
    
    spyOn(console, 'error');
    
    component.createConversation();
    tick();
    
    expect(component.error).toBe('Failed to create conversation');
    expect(console.error).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  }));

  it('should display conversations in the list', () => {
    conversationServiceSpy.getConversations.and.returnValue(of(mockConversations));
    fixture.detectChanges();
    
    const conversationCards = fixture.debugElement.queryAll(By.css('.conversation-card'));
    expect(conversationCards.length).toBe(2);
    
    const firstCard = conversationCards[0];
    const titleElement = firstCard.query(By.css('.conversation-title'));
    expect(titleElement.nativeElement.textContent).toContain('Test Conversation 1');
  });

  it('should display empty state when no conversations', () => {
    conversationServiceSpy.getConversations.and.returnValue(of([]));
    component.loading = false;
    fixture.detectChanges();
    
    const emptyState = fixture.debugElement.query(By.css('.empty-state'));
    expect(emptyState).toBeTruthy();
    
    const emptyStateText = emptyState.query(By.css('h3')).nativeElement.textContent;
    expect(emptyStateText).toContain('No conversations yet');
  });

  

  it('should display error message when error occurs', () => {
    conversationServiceSpy.getConversations.and.returnValue(of(mockConversations));
    component.error = 'Test error message';
    fixture.detectChanges();
    
    const errorElement = fixture.debugElement.query(By.css('.alert-danger'));
    expect(errorElement).toBeTruthy();
    expect(errorElement.nativeElement.textContent).toContain('Test error message');
  });
});