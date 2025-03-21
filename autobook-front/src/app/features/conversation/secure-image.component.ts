import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-secure-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <img 
  [src]="imageUrl || placeholderUrl" 
  [alt]="alt"
  [ngClass]="cssClass"
  (error)="onImageError()"
  class="secure-image"
>

  `,
  styles: `
  .secure-image {
    width: 100%;
    height: 100%;
    object-fit: cover; 
  }
  `
})
export class SecureImageComponent implements OnInit {
  @Input() url!: string;
  @Input() alt: string = 'Image';
  @Input() placeholderUrl: string = 'assets/images/placeholder-cover.jpg';
  @Input() cssClass: string = '';

  imageUrl: SafeUrl | null = null;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadImage();
  }

  loadImage(): void {
    if (!this.url) {
      return;
    }

    this.http.get(this.url, { responseType: 'blob' })
      .subscribe({
        next: (blob) => {
          const objectUrl = URL.createObjectURL(blob);
          this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        },
        error: () => {
          console.error(`Failed to load image from ${this.url}`);
        }
      });
  }

  onImageError(): void {
    this.imageUrl = null; 
  }
}