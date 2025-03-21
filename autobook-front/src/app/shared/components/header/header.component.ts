// header.component.ts
import { Component } from '@angular/core';
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
  
  logout(): void {
    this.authService.logout();
  }
}