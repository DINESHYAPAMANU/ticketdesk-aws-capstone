import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar navbar-expand bg-white border-bottom shadow-sm sticky-top px-3 py-2">
      <div class="d-flex align-items-center gap-3">
        <button type="button" class="btn btn-light border-0 text-secondary" (click)="toggleSidebar.emit()">
          <i class="bi bi-list fs-4"></i>
        </button>
        <a routerLink="/dashboard" class="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary m-0">
          <i class="bi bi-headset fs-3"></i>
          <span class="fs-5">TicketDesk</span>
        </a>
      </div>

      <div class="ms-auto d-flex align-items-center gap-3">
        <div class="d-flex align-items-center gap-2">
          <div class="avatar-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center">
            {{ userInitials() }}
          </div>
          <div class="d-none d-md-block text-start">
            <div class="fw-semibold small leading-none">{{ userFullName() }}</div>
            <span class="badge bg-secondary-subtle text-secondary border fs-xs mt-1">{{ userRole() }}</span>
          </div>
        </div>

        <button type="button" class="btn btn-outline-danger btn-sm rounded-pill px-3" (click)="onLogout()">
          <i class="bi bi-box-arrow-right me-1"></i> Logout
        </button>
      </div>
    </header>
  `,
  styles: [`
    .avatar-circle {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      font-size: 0.9rem;
    }
    .fs-xs {
      font-size: 0.7rem;
    }
  `]
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(public authService: AuthService) {}

  userFullName(): string {
    const user = this.authService.currentUser();
    return user ? user.fullName : 'User';
  }

  userRole(): string {
    return this.authService.getUserRole();
  }

  userInitials(): string {
    const name = this.userFullName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
