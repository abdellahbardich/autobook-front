import { Component, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { RouterLink } from "@angular/router"
import { ToastService } from "../../../shared/services/toast.service"

@Component({
  selector: "app-forgot-password",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Forgot Password</h1>
        
        <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              placeholder="Enter your email"
            >
            @if (email?.invalid && (email?.dirty || email?.touched)) {
              <div class="error-message">
                @if (email?.errors?.['required']) {
                  <span>Email is required</span>
                }
                @if (email?.errors?.['email']) {
                  <span>Please enter a valid email</span>
                }
              </div>
            }
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn-primary" 
              [disabled]="forgotPasswordForm.invalid || isSubmitting"
            >
              {{ isSubmitting ? 'Sending...' : 'Reset Password' }}
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
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder)
  private toastService = inject(ToastService)

  forgotPasswordForm: FormGroup = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
  })

  isSubmitting = false

  get email() {
    return this.forgotPasswordForm.get("email")
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) return

    this.isSubmitting = true

    // In a real app, this would call an API endpoint
    setTimeout(() => {
      this.toastService.show("Password reset instructions sent to your email", "success")
      this.isSubmitting = false
      this.forgotPasswordForm.reset()
    }, 1500)
  }
}

