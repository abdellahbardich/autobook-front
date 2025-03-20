import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Create Account</h1>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
  <label for="username">Username</label>
  <input 
    type="text" 
    id="username" 
    formControlName="username" 
    placeholder="Enter your username"
  >
  @if (username?.invalid && (username?.dirty || username?.touched)) {
    <div class="error-message">
      @if (username?.errors?.['required']) {
        <span>Username is required</span>
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
              [disabled]="registerForm.invalid || isLoading"
            >
              {{ isLoading ? 'Creating account...' : 'Create Account' }}
            </button>
          </div>
        </form>
        
        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/auth/login">Login</a></p>
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group(
    {
      username: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(8)]],
      confirmPassword: ["", Validators.required],
    },
    { validators: this.passwordMatchValidator },
  );

  isLoading = false;


  get username() {
    return this.registerForm.get("username");
  }
  get email() {
    return this.registerForm.get("email");
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get("password")?.value;
    const confirmPassword = form.get("confirmPassword")?.value;
    if (password !== confirmPassword) {
      form.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
  
    this.isLoading = true;
    const userData = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };
  
    this.authService.register(userData).subscribe({
      next: () => this.router.navigate(["/auth/login"]),
      error: () => (this.isLoading = false),
      complete: () => (this.isLoading = false),
    });
  }
}
