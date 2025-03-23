import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { StatisticsService } from '../../core/services/statistics.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterLink } from '@angular/router';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let statisticsServiceSpy: jasmine.SpyObj<StatisticsService>;

  const mockStats = {
    totalBooks: 25,
    totalConversations: 12,
    totalCollections: 5,
    booksByType: {
      TEXT_ONLY: 10,
      IMAGE_ONLY: 5,
      TEXT_IMAGE: 10
    },
    booksByStatus: {
      PENDING: 5,
      GENERATING: 8,
      COMPLETED: 10,
      FAILED: 2
    },
    creationActivity: [
      { month: '2023-01', conversations: 3, books: 2 },
      { month: '2023-02', conversations: 5, books: 3 },
      { month: '2023-03', conversations: 4, books: 4 }
    ]
  };

  beforeEach(async () => {
    jasmine.createSpy('Chart');
    
    statisticsServiceSpy = jasmine.createSpyObj('StatisticsService', ['getStatistics']);
    
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterLink],
      providers: [
        { provide: StatisticsService, useValue: statisticsServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA] 
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    
    spyOn(document, 'getElementById').and.returnValue(document.createElement('canvas'));
  });

  it('should create', () => {
    statisticsServiceSpy.getStatistics.and.returnValue(of(mockStats));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call loadStatistics on initialization', () => {
    statisticsServiceSpy.getStatistics.and.returnValue(of(mockStats));
    spyOn(component, 'loadStatistics');
    fixture.detectChanges();
    expect(component.loadStatistics).toHaveBeenCalled();
  });

 

  it('should handle error when loading statistics', () => {
    const errorMessage = 'Failed to load statistics';
    statisticsServiceSpy.getStatistics.and.returnValue(throwError(() => new Error(errorMessage)));
    
    fixture.detectChanges();
    
    expect(statisticsServiceSpy.getStatistics).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });

  it('should render charts after loading statistics', fakeAsync(() => {
    statisticsServiceSpy.getStatistics.and.returnValue(of(mockStats));
    spyOn(component, 'renderCharts');
    
    fixture.detectChanges();
    tick();
    
    expect(component.renderCharts).toHaveBeenCalled();
  }));

  it('should call all chart rendering methods', () => {
    statisticsServiceSpy.getStatistics.and.returnValue(of(mockStats));
    spyOn(component, 'renderBookTypeChart');
    spyOn(component, 'renderBookStatusChart');
    spyOn(component, 'renderActivityChart');
    
    component.renderCharts();
    
    expect(component.renderBookTypeChart).toHaveBeenCalled();
    expect(component.renderBookStatusChart).toHaveBeenCalled();
    expect(component.renderActivityChart).toHaveBeenCalled();
  });

  

 
  
});