import { Component } from "@angular/core"
import { RouterOutlet } from "@angular/router"
import { HeaderComponent } from "./core/components/header/header.component"
import { FooterComponent } from "./core/components/footer/footer.component"
import { ToastComponent } from "./shared/components/toast/toast.component"
import { AuthService } from "./core/services/auth.service"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastComponent],
  template: `
    <div class="app-container">
      <app-header />
      <main class="main-content">
        <router-outlet />
      </main>
      <app-footer />
      <app-toast />
    </div>
  `,
  styles: [
    `
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .main-content {
      flex: 1;
      padding: 1rem;
    }
  `,
  ],
})
export class AppComponent {
  constructor(private authService: AuthService) {
    this.authService.initAuth()
  }
}

