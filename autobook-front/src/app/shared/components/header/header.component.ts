// header.component.ts
import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
// import { AuthService } from '../../core/services/auth.service';


@Component({
    selector: 'app-header',
    standalone: true,
    imports: [RouterLink,CommonModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
  })
export class HeaderComponent {
  constructor(public authService: AuthService) {}
  isDropdownOpen = false;

  logout(): void {
    this.authService.logout();
  }
  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown')) {
      this.isDropdownOpen = false;
    }
  }
  
}