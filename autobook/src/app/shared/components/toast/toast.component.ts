import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ToastService } from "../../services/toast.service"
import { Toast } from "../../models/toast.model"

@Component({
  selector: "app-toast",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts; track toast.id) {
        <div 
          class="toast" 
          [ngClass]="toast.type"
          (click)="removeToast(toast.id)"
        >
          <div class="toast-content">
            <p>{{ toast.message }}</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
    .toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .toast {
      min-width: 250px;
      padding: 15px;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      animation: slide-in 0.3s ease-out;
      cursor: pointer;
    }
    
    .toast.success {
      background-color: #2ecc71;
      color: white;
    }
    
    .toast.error {
      background-color: #e74c3c;
      color: white;
    }
    
    .toast.info {
      background-color: #3498db;
      color: white;
    }
    
    .toast.warning {
      background-color: #f39c12;
      color: white;
    }
    
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,
  ],
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = []

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$.subscribe((toasts) => {
      this.toasts = toasts
    })
  }

  removeToast(id: string): void {
    this.toastService.remove(id)
  }
}

