import { Component, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { AuthService } from "../../core/services/auth.service"
import { User } from "../../shared/models/user.model"
import { ToastService } from "../../shared/services/toast.service"

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-card">
        <h1>Your Profile</h1>
        
        @if (isLoading) {
          <div class="loading">
            <p>Loading your profile...</p>
          </div>
        } @else if (!user) {
          <div class="not-found">
            <p>Unable to load profile information.</p>
          </div>
        } @else {
          <div class="profile-header">
            <div class="avatar">
              @if (user.avatar) {
                <img [src]="user.avatar" [alt]="user.name" />
              } @else {
                <div class="avatar-placeholder">
                  {{ user.name.charAt(0) }}
                </div>
              }
            </div>
            <div class="user-info">
              <h2>{{ user.name }}</h2>
              <p>{{ user.email }}</p>
              <p class="user-since">Member since {{ user.createdAt | date:'mediumDate' }}</p>
            </div>
          </div>
          
          <div class="profile-form">
            <h3>Update Profile</h3>
            <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
              <div class="form-group">
                <label for="name">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  formControlName="name" 
                  placeholder="Enter your full name"
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
                <label for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  formControlName="email" 
                  placeholder="Enter your email"
                >
              </div>
              
              <div class="form-actions">
                <button 
                  type="submit" 
                  class="btn-update" 
                  [disabled]="profileForm.invalid || isSubmitting || !profileForm.dirty"
                >
                  {{ isSubmitting ? 'Updating...' : 'Update Profile' }}
                </button>
              </div>
            </form>
          </div>
          
          <div class="password-form">
            <h3>Change Password</h3>
            <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
              <div class="form-group">
                <label for="currentPassword">Current Password</label>
                <input 
                  type="password" 
                  id="currentPassword" 
                  formControlName="currentPassword" 
                  placeholder="Enter your current password"
                >
                @if (currentPassword?.invalid && (currentPassword?.dirty || currentPassword?.touched)) {
                  <div class="error-message">
                    @if (currentPassword?.errors?.['required']) {
                      <span>Current password is required</span>
                    }
                  </div>
                }
              </div>
              
              <div class="form-group">
                <label for="newPassword">New Password</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  formControlName="newPassword" 
                  placeholder="Enter your new password"
                >
                @if (newPassword?.invalid && (newPassword?.dirty || newPassword?.touched)) {
                  <div class="error-message">
                    @if (newPassword?.errors?.['required']) {
                      <span>New password is required</span>
                    }
                    @if (newPassword?.errors?.['minlength']) {
                      <span>Password must be at least 8 characters</span>
                    }
                  </div>
                }
              </div>
              
              <div class="form-group">
                <label for="confirmPassword">Confirm New Password</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  formControlName="confirmPassword" 
                  placeholder="Confirm your new password"
                >
                @if (confirmPassword?.invalid && (confirmPassword?.dirty || confirmPassword?.touched)) {
                  <div class="error-message">
                    @if (confirmPassword?.errors?.['required']) {
                      <span>Please confirm your password</span>
                    }
                  </div>
                }
                @if (passwordForm.errors?.['passwordMismatch'] && confirmPassword?.dirty) {
                  <div class="error-message">
                    <span>Passwords do not match</span>
                  </div>
                }
              </div>
              
              <div class="form-actions">
                <button 
                  type="submit" 
                  class="btn-update" 
                  [disabled]="passwordForm.invalid || isChangingPassword"
                >
                  {{ isChangingPassword ? 'Changing Password...' : 'Change Password' }}
                </button>
              </div>
            </form>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .profile-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 2rem;
    }
    
    h1 {
      text-align: center;
      margin-bottom: 2rem;
      color: #2c3e50;
    }
    
    .loading, .not-found {
      text-align: center;
      padding: 3rem;
      background-color: #f8f9fa;
      border-radius: 8px;
    }
    
    .profile-header {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #ecf0f1;
    }
    
    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
    }
    
    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background-color: #3498db;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      font-weight: bold;
    }
    
    .user-info h2 {
      margin: 0 0 0.5rem;
      color: #2c3e50;
    }
    
    .user-info p {
      margin: 0 0 0.25rem;
      color: #7f8c8d;
    }
    
    .user-since {
      font-size: 0.9rem;
      opacity: 0.7;
    }
    
    .profile-form, .password-form {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #ecf0f1;
    }
    
    .profile-form:last-child, .password-form:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    
    h3 {
      font-size: 1.25rem;
      color: #2c3e50;
      margin-bottom: 1.5rem;
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
    
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    input:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
    
    input:disabled {
      background-color: #f8f9fa;
      cursor: not-allowed;
    }
    
    .error-message {
      color: #e74c3c;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
    }
    
    .btn-update {
      background-color: #3498db;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-update:hover {
      background-color: #2980b9;
    }
    
    .btn-update:disabled {
      background-color: #95a5a6;
      cursor: not-allowed;
    }
    
    @media (max-width: 768px) {
      .profile-header {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }
    }
  `,
  ],
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService)
  private fb = inject(FormBuilder)
  private toastService = inject(ToastService)

  user: User | null = null
  isLoading = true
  isSubmitting = false
  isChangingPassword = false

  profileForm: FormGroup = this.fb.group({
    name: ["", Validators.required],
    email: [{ value: "", disabled: true }],
  })

  passwordForm: FormGroup = this.fb.group(
    {
      currentPassword: ["", Validators.required],
      newPassword: ["", [Validators.required, Validators.minLength(8)]],
      confirmPassword: ["", Validators.required],
    },
    { validators: this.passwordMatchValidator },
  )

  get name() {
    return this.profileForm.get("name")
  }
  get currentPassword() {
    return this.passwordForm.get("currentPassword")
  }
  get newPassword() {
    return this.passwordForm.get("newPassword")
  }
  get confirmPassword() {
    return this.passwordForm.get("confirmPassword")
  }

  ngOnInit(): void {
    this.loadUserProfile()
  }

  loadUserProfile(): void {
    this.isLoading = true
    this.authService.user$.subscribe({
      next: (user) => {
        this.user = user

        if (user) {
          this.profileForm.patchValue({
            name: user.name,
            email: user.email,
          })
        }

        this.isLoading = false
      },
      error: () => {
        this.isLoading = false
      },
    })
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return

    this.isSubmitting = true

    // In a real app, this would call an API endpoint
    setTimeout(() => {
      this.toastService.show("Profile updated successfully", "success")
      this.isSubmitting = false
      this.profileForm.markAsPristine()
    }, 1000)
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return

    this.isChangingPassword = true

    // In a real app, this would call an API endpoint
    setTimeout(() => {
      this.toastService.show("Password changed successfully", "success")
      this.isChangingPassword = false
      this.passwordForm.reset()
    }, 1000)
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get("newPassword")?.value
    const confirmPassword = form.get("confirmPassword")?.value

    if (password !== confirmPassword) {
      form.setErrors({ passwordMismatch: true })
      return { passwordMismatch: true }
    }

    return null
  }
}

