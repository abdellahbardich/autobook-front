import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { UserProfileService } from '../core/services/user-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
// import { UserProfile } from '../../../core/models/user-profile.model';
// import { ToastService } from '../shared/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
//   private userProfileService = inject(UserProfileService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
//   private toastService = inject(ToastService);

  user: User | null = null;
  isLoading = true;
  isSubmitting = false;
  isChangingPassword = false;
  updateSuccess = false;
  passwordSuccess = false;
  activeTab = 'profile';
  formattedDate = '';

  // Password visibility toggles
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  profileForm: FormGroup = this.fb.group({
    username: [{ value: '', disabled: true }],
    name: ['', Validators.required],
    email: [{ value: '', disabled: true }],
    bio: ['']
  });

  passwordForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: this.passwordMatchValidator }
  );

  get name() {
    return this.profileForm.get('name');
  }
  
  get currentPassword() {
    return this.passwordForm.get('currentPassword');
  }
  
  get newPassword() {
    return this.passwordForm.get('newPassword');
  }
  
  get confirmPassword() {
    return this.passwordForm.get('confirmPassword');
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    
    this.authService.getUserProfile().subscribe({
      next: (profile) => {
        this.user = profile;
        
        // Format creation date
        

        // Populate form
        this.profileForm.patchValue({
          username: profile.username,
          name: profile.username || profile.username,
          email: profile.email,
        //   bio: profile. || ''
        });

        this.isLoading = false;
      },
    //   error: (error) => {
    //     console.error('Error loading profile:', error);
    //     // this.toastService.show('Failed to load profile data. Please try again.', 'error');
    //     this.isLoading = false;
    //   }
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid || !this.profileForm.dirty) return;

    this.isSubmitting = true;
    this.updateSuccess = false;

    // Only include changed fields
    const updatedData: Partial<User> = {};
    const formValue = this.profileForm.getRawValue();

    if (this.user?.username !== formValue.name) {
      updatedData.username = formValue.name;
    }

    

    // In a real app, this would call the API service
    // This is a mock implementation for demonstration purposes
    setTimeout(() => {
      // Update local user data
      if (this.user) {
        this.user = { ...this.user, ...updatedData };
      }
      
    //   this.toastService.show('Profile updated successfully', 'success');
      this.updateSuccess = true;
      this.isSubmitting = false;
      this.profileForm.markAsPristine();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        this.updateSuccess = false;
      }, 3000);
    }, 1000);
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    this.isChangingPassword = true;
    this.passwordSuccess = false;

    const passwordData = {
      currentPassword: this.passwordForm.get('currentPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value
    };

    // In a real app, this would call the API service
    // This is a mock implementation for demonstration purposes
    setTimeout(() => {
    //   this.toastService.show('Password changed successfully', 'success');
      this.passwordSuccess = true;
      this.isChangingPassword = false;
      this.resetPasswordForm();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        this.passwordSuccess = false;
      }, 3000);
    }, 1000);
  }

  resetForm(): void {
    if (this.user) {
      this.profileForm.patchValue({
        username: this.user.username,
        name: this.user.username || this.user.username,
        email: this.user.email,
      });
    }
    this.profileForm.markAsPristine();
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }
}