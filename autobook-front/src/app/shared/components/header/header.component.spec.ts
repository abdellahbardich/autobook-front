import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';

class MockAuthService {
  logout = jasmine.createSpy('logout');
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockAuthService: MockAuthService;
  let router: Router;

  beforeEach(async () => {
    mockAuthService = new MockAuthService();

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the header component', () => {
    expect(component).toBeTruthy();
  });

  it('should call AuthService.logout and navigate on logout', () => {
    const navigateSpy = spyOn(router, 'navigate');

    component.logout();

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should toggle the dropdown state', () => {
    expect(component.isDropdownOpen).toBeFalse();
    component.toggleDropdown(new Event('click'));
    expect(component.isDropdownOpen).toBeTrue();
    component.toggleDropdown(new Event('click'));
    expect(component.isDropdownOpen).toBeFalse();
  });

  it('should close dropdown on closeDropdown call', () => {
    component.isDropdownOpen = true;
    component.closeDropdown();
    expect(component.isDropdownOpen).toBeFalse();
  });

  it('should close dropdown if clicking outside the dropdown', () => {
    component.isDropdownOpen = true;
    const clickEvent = new MouseEvent('click', { bubbles: true });
    spyOnProperty(clickEvent, 'target', 'get').and.returnValue(document.createElement('div'));

    component.onDocumentClick(clickEvent);
    expect(component.isDropdownOpen).toBeFalse();
  });

  it('should not close dropdown if clicking inside the dropdown', () => {
    component.isDropdownOpen = true;
    const dropdownElement = document.createElement('div');
    dropdownElement.classList.add('user-dropdown');
    const clickEvent = new MouseEvent('click', { bubbles: true });
    spyOnProperty(clickEvent, 'target', 'get').and.returnValue(dropdownElement);

    component.onDocumentClick(clickEvent);
    expect(component.isDropdownOpen).toBeTrue();
  });
});
