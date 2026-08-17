import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar bg-slate-900 text-white p-3 d-flex flex-column h-100" [class.collapsed]="collapsed">
      <div class="sidebar-header mb-4 px-2 d-flex align-items-center justify-content-between">
        <span class="fw-bold text-uppercase text-slate-400 small tracking-wider">Navigation</span>
      </div>

      <ul class="nav nav-pills flex-column mb-auto gap-1">
        <li class="nav-item">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link text-slate-300 d-flex align-items-center gap-3 py-2.5 px-3 rounded-3">
            <i class="bi bi-speedometer2 fs-5"></i>
            <span class="nav-text">Dashboard</span>
          </a>
        </li>

        <li class="nav-item">
          <a routerLink="/tickets" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link text-slate-300 d-flex align-items-center gap-3 py-2.5 px-3 rounded-3">
            <i class="bi bi-ticket-perforated fs-5"></i>
            <span class="nav-text">Tickets List</span>
          </a>
        </li>

        <li class="nav-item">
          <a routerLink="/tickets/create" routerLinkActive="active" class="nav-link text-slate-300 d-flex align-items-center gap-3 py-2.5 px-3 rounded-3">
            <i class="bi bi-plus-circle fs-5"></i>
            <span class="nav-text">Create Ticket</span>
          </a>
        </li>

        <li class="nav-item mt-3">
          <span class="fw-bold text-uppercase text-slate-400 small tracking-wider px-2">Account</span>
        </li>

        <li class="nav-item mt-1">
          <a routerLink="/profile" routerLinkActive="active" class="nav-link text-slate-300 d-flex align-items-center gap-3 py-2.5 px-3 rounded-3">
            <i class="bi bi-person-gear fs-5"></i>
            <span class="nav-text">User Profile</span>
          </a>
        </li>
      </ul>

      <div class="sidebar-footer mt-auto pt-3 border-top border-secondary-subtle">
        <button type="button" class="btn btn-link text-slate-400 text-decoration-none w-100 d-flex align-items-center gap-3 py-2 px-2" (click)="onLogout()">
          <i class="bi bi-box-arrow-right fs-5 text-danger"></i>
          <span class="nav-text text-danger fw-semibold">Logout</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .bg-slate-900 {
      background-color: #0f172a;
    }
    .text-slate-300 {
      color: #cbd5e1;
    }
    .text-slate-400 {
      color: #94a3b8;
    }
    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: #ffffff !important;
    }
    .nav-link.active {
      background-color: #2563eb !important;
      color: #ffffff !important;
    }
    .tracking-wider {
      letter-spacing: 0.05em;
    }
    .sidebar {
      width: 250px;
      transition: all 0.3s ease;
    }
    .sidebar.collapsed {
      width: 70px;
    }
    .sidebar.collapsed .nav-text,
    .sidebar.collapsed .sidebar-header {
      display: none !important;
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;

  constructor(private authService: AuthService) {}

  onLogout(): void {
    this.authService.logout();
  }
}
