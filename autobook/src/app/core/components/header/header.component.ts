import { Component, computed, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink, RouterLinkActive } from "@angular/router"
import { AuthService } from "../../services/auth.service"
import { BookService } from "../../../features/books/services/book.service"

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="container">
        <div class="logo">
          <a routerLink="/">AI Book Generator</a>
        </div>
        
        <nav class="nav">
          @if (isAuthenticated()) {
            <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
            <a routerLink="/books" routerLinkActive="active">My Books</a>
            <a routerLink="/profile" routerLinkActive="active">Profile</a>
            <button class="btn-logout" (click)="logout()">Logout</button>
          } @else {
            <a routerLink="/auth/login" routerLinkActive="active">Login</a>
            <a routerLink="/auth/register" routerLinkActive="active">Register</a>
          }
        </nav>
      </div>
      
      @if (currentBookTitle() && isAuthenticated()) {
        <div class="current-book-banner">
          <span>Currently editing: </span>
          <strong>{{ currentBookTitle() }}</strong>
        </div>
      }
    </header>
  `,
  styles: [
    `
    .header {
      background-color: #2c3e50;
      color: white;
      padding: 1rem 0;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo a {
      color: white;
      text-decoration: none;
      font-size: 1.5rem;
      font-weight: bold;
    }
    
    .nav {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }
    
    .nav a {
      color: white;
      text-decoration: none;
      transition: color 0.3s;
    }
    
    .nav a:hover, .nav a.active {
      color: #3498db;
    }
    
    .btn-logout {
      background-color: #e74c3c;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-logout:hover {
      background-color: #c0392b;
    }
    
    .current-book-banner {
      background-color: #3498db;
      color: white;
      padding: 0.5rem;
      text-align: center;
      font-size: 0.9rem;
    }
  `,
  ],
})
export class HeaderComponent {
  private authService = inject(AuthService)
  private bookService = inject(BookService)

  isAuthenticated = this.authService.isAuthenticated
  currentBookTitle = computed(() => this.bookService.currentBookTitle())

  logout(): void {
    this.authService.logout()
  }
}

