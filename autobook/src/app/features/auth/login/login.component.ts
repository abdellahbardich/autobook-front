import { Component, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router, ActivatedRoute, RouterLink } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Login</h1>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="usernameOrEmail">Username or Email</label>
            <input 
              type="text" 
              id="usernameOrEmail" 
              formControlName="usernameOrEmail" 
              placeholder="Enter your username or email"
            >
            @if (usernameOrEmail?.invalid && (usernameOrEmail?.dirty || usernameOrEmail?.touched)) {
              <div class="error-message">
                @if (usernameOrEmail?.errors?.['required']) {
                  <span>Username or Email is required</span>
                }
              </div>
            }
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password" 
              placeholder="Enter your password"
            >
            @if (password?.invalid && (password?.dirty || password?.touched)) {
              <div class="error-message">
                @if (password?.errors?.['required']) {
                  <span>Password is required</span>
                }
              </div>
            }
          </div>

          <div class="form-actions">
            <a routerLink="/auth/forgot-password" class="forgot-password">Forgot password?</a>
            <button 
              type="submit" 
              class="btn-primary" 
              [disabled]="loginForm.invalid || isLoading"
            >
              {{ isLoading ? 'Logging in...' : 'Login' }}
            </button>
          </div>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/auth/register">Register</a></p>
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
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
    }

    .forgot-password {
      color: #7f8c8d;
      text-decoration: none;
      font-size: 0.9rem;
    }

    .forgot-password:hover {
      color: #3498db;
      text-decoration: underline;
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
export class LoginComponent {
  private fb = inject(FormBuilder)
  private authService = inject(AuthService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)

  loginForm: FormGroup = this.fb.group({
    usernameOrEmail: ["", Validators.required],
    password: ["", Validators.required],
  })

  isLoading = false

  get usernameOrEmail() {
    return this.loginForm.get("usernameOrEmail")
  }
  get password() {
    return this.loginForm.get("password")
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return

    this.isLoading = true
    const { usernameOrEmail, password } = this.loginForm.value

    this.authService.login(usernameOrEmail, password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/dashboard"
        this.router.navigateByUrl(returnUrl)
      },
      error: () => {
        this.isLoading = false
      },
      complete: () => {
        this.isLoading = false
      },
    })
  }
}