import { Component, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { ToastService } from "../../../shared/services/toast.service"

@Component({
  selector: "app-reset-password",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Reset Password</h1>
        
        <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="password">New Password</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password" 
              placeholder="Enter your new password"
            >
            @if (password?.invalid && (password?.dirty || password?.touched)) {
              <div class="error-message">
                @if (password?.errors?.['required']) {
                  <span>Password is required</span>
                }
                @if (password?.errors?.['minlength']) {
                  <span>Password must be at least 8 characters</span>
                }
              </div>
            }
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
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
            @if (resetPasswordForm.errors?.['passwordMismatch'] && confirmPassword?.dirty) {
              <div class="error-message">
                <span>Passwords do not match</span>
              </div>
            }
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn-primary" 
              [disabled]="resetPasswordForm.invalid || isSubmitting"
            >
              {{ isSubmitting ? 'Resetting...' : 'Reset Password' }}
            </button>
          </div>
        </form>
        
        <div class="auth-footer">
          <p>Remember your password? <a routerLink="/auth/login">Login</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 140px);
      padding: 2rem;
    }
    
    .auth-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      width: 100%;
      max-width: 400px;
    }
    
    h1 {
      text-align: center;
      margin-bottom: 2rem;
      color: #2c3e50;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
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
    
    .error-message {
      color: #e74c3c;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }
    
    .form-actions {
      display: flex;
      justify-content: center;
      margin-top: 1rem;
    }
    
    .btn-primary {
      background-color: #3498db;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
      width: 100%;
    }
    
    .btn-primary:hover {
      background-color: #2980b9;
    }
    
    .btn-primary:disabled {
      background-color: #95a5a6;
      cursor: not-allowed;
    }
    
    .auth-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #ecf0f1;
    }
    
    .auth-footer a {
      color: #3498db;
      text-decoration: none;
    }
    
    .auth-footer a:hover {
      text-decoration: underline;
    }
  `,
  ],
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder)
  private router = inject(Router)
  private toastService = inject(ToastService)

  resetPasswordForm: FormGroup = this.fb.group(
    {
      password: ["", [Validators.required, Validators.minLength(8)]],
      confirmPassword: ["", Validators.required],
    },
    { validators: this.passwordMatchValidator },
  )

  isSubmitting = false

  get password() {
    return this.resetPasswordForm.get("password")
  }
  get confirmPassword() {
    return this.resetPasswordForm.get("confirmPassword")
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get("password")?.value
    const confirmPassword = form.get("confirmPassword")?.value

    if (password !== confirmPassword) {
      form.setErrors({ passwordMismatch: true })
      return { passwordMismatch: true }
    }

    return null
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) return

    this.isSubmitting = true

    // In a real app, this would call an API endpoint
    setTimeout(() => {
      this.toastService.show("Password has been reset successfully", "success")
      this.router.navigate(["/auth/login"])
    }, 1500)
  }
}

