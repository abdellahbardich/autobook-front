// footer.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [],
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
  })
export class FooterComponent {
  currentYear = new Date().getFullYear();
}