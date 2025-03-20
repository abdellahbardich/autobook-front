import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"

@Component({
  selector: "app-not-found",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <a routerLink="/" class="btn-home">Go to Home</a>
      </div>
    </div>
  `,
  styles: [
    `
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 140px);
      padding: 2rem;
    }
    
    .not-found-content {
      text-align: center;
      max-width: 500px;
    }
    
    h1 {
      font-size: 6rem;
      color: #3498db;
      margin: 0;
      line-height: 1;
    }
    
    h2 {
      font-size: 2rem;
      color: #2c3e50;
      margin: 1rem 0;
    }
    
    p {
      color: #7f8c8d;
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }
    
    .btn-home {
      background-color: #3498db;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      transition: background-color 0.3s;
    }
    
    .btn-home:hover {
      background-color: #2980b9;
    }
  `,
  ],
})
export class NotFoundComponent {}

