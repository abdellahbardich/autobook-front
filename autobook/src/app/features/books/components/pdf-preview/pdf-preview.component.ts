import { Component, Input, type OnChanges, type SimpleChanges } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-pdf-preview",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pdf-preview">
      <h2>PDF Preview</h2>
      <div class="pdf-container">
        <iframe [src]="safeUrl" *ngIf="safeUrl" title="PDF Preview"></iframe>
        <div class="pdf-placeholder" *ngIf="!safeUrl">
          <p>PDF preview not available</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .pdf-preview {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 2rem;
    }
    
    h2 {
      font-size: 1.5rem;
      color: #2c3e50;
      margin: 0 0 1rem;
    }
    
    .pdf-container {
      width: 100%;
      height: 600px;
      border: 1px solid #ecf0f1;
      border-radius: 4px;
      overflow: hidden;
    }
    
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    
    .pdf-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
    }
    
    .pdf-placeholder p {
      color: #7f8c8d;
    }
  `,
  ],
})
export class PdfPreviewComponent implements OnChanges {
  @Input() pdfUrl: string | undefined
  safeUrl: any

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["pdfUrl"] && this.pdfUrl) {
      // In a real app, you would use DomSanitizer.bypassSecurityTrustResourceUrl
      // But for simplicity in this example, we're just setting it directly
      this.safeUrl = this.pdfUrl
    }
  }
}

