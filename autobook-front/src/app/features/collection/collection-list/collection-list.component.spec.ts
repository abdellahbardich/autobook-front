import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionListComponent } from './collection-list.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CollectionService } from '../../../core/services/collection.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

describe('CollectionListComponent', () => {
  let component: CollectionListComponent;
  let fixture: ComponentFixture<CollectionListComponent>;
  let collectionServiceSpy: jasmine.SpyObj<CollectionService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockCollections = [
    {
      collectionId: 1,
      name: 'Test Collection 1',
      description: 'Description 1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      collectionId: 2,
      name: 'Test Collection 2',
      description: 'Description 2',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(async () => {
    collectionServiceSpy = jasmine.createSpyObj('CollectionService', [
      'getCollections',
      'createCollection',
      'deleteCollection'
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    collectionServiceSpy.getCollections.and.returnValue(of(mockCollections));

    collectionServiceSpy.createCollection.and.returnValue(of({ collectionId: 3 }) as any);
    collectionServiceSpy.deleteCollection.and.returnValue(of({}) as any);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        CommonModule,
        CollectionListComponent
      ],
      providers: [
        FormBuilder,
        { provide: CollectionService, useValue: collectionServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignore unknown elements
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize form correctly', () => {
    fixture.detectChanges();
    expect(component.collectionForm).toBeDefined();
    expect(component.collectionForm.get('name')).toBeDefined();
    expect(component.collectionForm.get('description')).toBeDefined();
  });

  it('should load collections on init', () => {
    spyOn(component, 'loadCollections');
    
    fixture.detectChanges();
    
    expect(component.loadCollections).toHaveBeenCalled();
  });

  it('should load collections from service', () => {
    component.loadCollections();
    
    expect(collectionServiceSpy.getCollections).toHaveBeenCalled();
    expect(component.collections).toEqual(mockCollections);
    expect(component.loading).toBeFalse();
  });

  it('should toggle form visibility', () => {
    fixture.detectChanges();
    
    expect(component.showForm).toBeFalse();
    
    component.toggleForm();
    expect(component.showForm).toBeTrue();
    
    component.toggleForm();
    expect(component.showForm).toBeFalse();
  });

  it('should not create collection if form is invalid', () => {
    fixture.detectChanges();
    
    component.collectionForm.setErrors({ 'invalid': true });
    component.createCollection();
    
    expect(collectionServiceSpy.createCollection).not.toHaveBeenCalled();
  });

  it('should create collection successfully', () => {
    fixture.detectChanges();
    
    spyOn(component, 'loadCollections');
    
    // Set form values
    component.collectionForm.setValue({
      name: 'New Collection',
      description: 'New Description'
    });
    
    component.createCollection();
    
    expect(collectionServiceSpy.createCollection).toHaveBeenCalled();
    expect(component.loadCollections).toHaveBeenCalled();
    expect(component.showForm).toBeFalse();
  });

  it('should navigate to collection details', () => {
    fixture.detectChanges();
    
    component.openCollection(1);
    
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/collections', 1]);
  });

  it('should delete collection after confirmation', () => {
    fixture.detectChanges();
    
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component, 'loadCollections');
    
    const event = jasmine.createSpyObj('Event', ['stopPropagation']);
    
    component.deleteCollection(event, 1);
    
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(window.confirm).toHaveBeenCalled();
    expect(collectionServiceSpy.deleteCollection).toHaveBeenCalledWith(1);
    expect(component.loadCollections).toHaveBeenCalled();
  });

  it('should not delete collection if not confirmed', () => {
    fixture.detectChanges();
    
    spyOn(window, 'confirm').and.returnValue(false);
    
    const event = jasmine.createSpyObj('Event', ['stopPropagation']);
    
    component.deleteCollection(event, 1);
    
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(window.confirm).toHaveBeenCalled();
    expect(collectionServiceSpy.deleteCollection).not.toHaveBeenCalled();
  });
});