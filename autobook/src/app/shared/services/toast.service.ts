import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"
import type { Toast, ToastType } from "../models/toast.model"

@Injectable({
  providedIn: "root",
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([])
  toasts$ = this.toastsSubject.asObservable()

  show(message: string, type: ToastType = "info", duration = 5000): void {
    const id = this.generateId()
    const toast: Toast = { id, message, type }

    this.toastsSubject.next([...this.toastsSubject.value, toast])

    setTimeout(() => {
      this.remove(id)
    }, duration)
  }

  remove(id: string): void {
    const currentToasts = this.toastsSubject.value
    this.toastsSubject.next(currentToasts.filter((toast) => toast.id !== id))
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9)
  }
}

