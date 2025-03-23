import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../../../core/services/auth.service';
import { of } from 'rxjs';
import { ProfileComponent } from './profile.componenet';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockUser = {
    userId: 1,
    username: 'testuser',
    email: 'test@example.com'
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserProfile']);
    authServiceSpy.getUserProfile.and.returnValue(of(mockUser as any));

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        CommonModule,
        HttpClientTestingModule,
        ProfileComponent
      ],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize both forms with validators', () => {
    expect(component.profileForm).toBeDefined();
    expect(component.passwordForm).toBeDefined();
    
    expect(component.profileForm.get('username')).toBeDefined();
    expect(component.profileForm.get('name')).toBeDefined();
    expect(component.profileForm.get('email')).toBeDefined();
    expect(component.profileForm.get('bio')).toBeDefined();
    
    expect(component.passwordForm.get('currentPassword')).toBeDefined();
    expect(component.passwordForm.get('newPassword')).toBeDefined();
    expect(component.passwordForm.get('confirmPassword')).toBeDefined();
  });

  it('should load user profile on init', () => {
    expect(authServiceSpy.getUserProfile).toHaveBeenCalled();
    expect(component.user).toEqual(mockUser as any);
    expect(component.isLoading).toBeFalse();
  });

  it('should populate profile form with user data', () => {
    expect(component.profileForm.get('username')?.value).toBe('testuser');
    expect(component.profileForm.get('name')?.value).toBe('testuser');
    expect(component.profileForm.get('email')?.value).toBe('test@example.com');
  });

  it('should validate name in profile form', () => {
    const nameControl = component.profileForm.get('name');
    
    nameControl?.setValue('');
    expect(nameControl?.valid).toBeFalsy();
    expect(nameControl?.hasError('required')).toBeTruthy();
    
    nameControl?.setValue('Test User');
    expect(nameControl?.valid).toBeTruthy();
  });

  it('should validate password fields', () => {
    const currentPasswordControl = component.passwordForm.get('currentPassword');
    const newPasswordControl = component.passwordForm.get('newPassword');
    const confirmPasswordControl = component.passwordForm.get('confirmPassword');
    
    currentPasswordControl?.setValue('');
    expect(currentPasswordControl?.valid).toBeFalsy();
    expect(currentPasswordControl?.hasError('required')).toBeTruthy();
    
    currentPasswordControl?.setValue('current123');
    expect(currentPasswordControl?.valid).toBeTruthy();
    
    newPasswordControl?.setValue('');
    expect(newPasswordControl?.valid).toBeFalsy();
    expect(newPasswordControl?.hasError('required')).toBeTruthy();
    
    newPasswordControl?.setValue('1234567');
    expect(newPasswordControl?.valid).toBeFalsy();
    expect(newPasswordControl?.hasError('minlength')).toBeTruthy();
    
    newPasswordControl?.setValue('12345678');
    expect(newPasswordControl?.valid).toBeTruthy();
    
    confirmPasswordControl?.setValue('');
    expect(confirmPasswordControl?.valid).toBeFalsy();
    expect(confirmPasswordControl?.hasError('required')).toBeTruthy();
    
    confirmPasswordControl?.setValue('12345678');
    expect(confirmPasswordControl?.valid).toBeTruthy();
  });

  it('should validate password match', () => {
    component.passwordForm.setValue({
      currentPassword: 'current123',
      newPassword: '12345678',
      confirmPassword: 'different'
    });
    
    expect(component.passwordForm.hasError('passwordMismatch')).toBeTrue();
    
    component.passwordForm.setValue({
      currentPassword: 'current123',
      newPassword: '12345678',
      confirmPassword: '12345678'
    });
    
    expect(component.passwordForm.hasError('passwordMismatch')).toBeFalsy();
  });

  it('should update profile', fakeAsync(() => {
    component.profileForm.get('name')?.setValue('Updated Name');
    component.profileForm.markAsDirty();
    
    component.updateProfile();
    tick(1000); 
    
    expect(component.isSubmitting).toBeFalse();
    expect(component.updateSuccess).toBeTrue();
    
    tick(3000);
    expect(component.updateSuccess).toBeFalse();
  }));

  it('should not update profile if form is invalid', () => {
    component.profileForm.get('name')?.setValue('');
    component.profileForm.get('name')?.markAsDirty();
    spyOn(window, 'setTimeout');
    
    component.updateProfile();
    
    expect(component.isSubmitting).toBeFalse();
    expect(window.setTimeout).not.toHaveBeenCalled();
  });

  it('should not update profile if form is not dirty', () => {
    component.profileForm.get('name')?.setValue('testuser');
    component.profileForm.markAsPristine();
    spyOn(window, 'setTimeout');
    
    component.updateProfile();
    
    expect(component.isSubmitting).toBeFalse();
    expect(window.setTimeout).not.toHaveBeenCalled();
  });

  it('should change password', fakeAsync(() => {
    component.passwordForm.setValue({
      currentPassword: 'current123',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123'
    });
    
    component.changePassword();
    tick(1000); 
    
    expect(component.isChangingPassword).toBeFalse();
    expect(component.passwordSuccess).toBeTrue();
    
    expect(component.passwordForm.get('currentPassword')?.value).toBeFalsy();
    expect(component.passwordForm.get('newPassword')?.value).toBeFalsy();
    expect(component.passwordForm.get('confirmPassword')?.value).toBeFalsy();
    
    tick(3000);
    expect(component.passwordSuccess).toBeFalse();
  }));

  it('should not change password if form is invalid', () => {
    component.passwordForm.setValue({
      currentPassword: 'current123',
      newPassword: 'new123',
      confirmPassword: 'different'
    });
    
    spyOn(window, 'setTimeout');
    
    component.changePassword();
    
    expect(component.isChangingPassword).toBeFalse();
    expect(window.setTimeout).not.toHaveBeenCalled();
  });

  it('should reset profile form', () => {
    component.profileForm.patchValue({
      name: 'Changed Name',
      bio: 'New bio'
    });
    component.profileForm.markAsDirty();
    
    component.resetForm();
    
    expect(component.profileForm.get('name')?.value).toBe('testuser');
    expect(component.profileForm.pristine).toBeTrue();
  });

  it('should reset password form', () => {
    component.passwordForm.setValue({
      currentPassword: 'current123',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123'
    });
    
    component.resetPasswordForm();
    
    expect(component.passwordForm.get('currentPassword')?.value).toBeFalsy();
    expect(component.passwordForm.get('newPassword')?.value).toBeFalsy();
    expect(component.passwordForm.get('confirmPassword')?.value).toBeFalsy();
  });

  it('should switch between tabs', () => {
    expect(component.activeTab).toBe('profile');
    
    component.activeTab = 'password';
    expect(component.activeTab).toBe('password');
    
    component.activeTab = 'profile';
    expect(component.activeTab).toBe('profile');
  });
});