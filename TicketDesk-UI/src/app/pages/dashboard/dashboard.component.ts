import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { TicketService } from '../../services/ticket.service';
import { DashboardSummary } from '../../models/dashboard.model';
import { Ticket } from '../../models/ticket.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page py-2">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 class="fw-bold text-dark m-0">
            {{ authService.isAdmin() ? 'Corporate Telemetry Dashboard' : 'My Support Portal Dashboard' }}
          </h2>
          <p class="text-muted small mb-0">
            {{ authService.isAdmin() ? 'Overview of system tickets, workload priority, and resolution progress' : 'Overview of your submitted tickets, status updates, and support progress' }}
          </p>
        </div>
        <a routerLink="/tickets/create" class="btn btn-primary rounded-pill shadow-sm d-flex align-items-center gap-2">
          <i class="bi bi-plus-lg"></i>
          <span>Create New Ticket</span>
        </a>
      </div>

      <!-- Telemetry Cards -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-xl">
          <div class="card glass-card border-0 p-3 h-100 border-start border-4 border-primary">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="text-muted small fw-semibold text-uppercase">Total Tickets</span>
                <h3 class="fw-bold text-dark mt-2 mb-0">{{ summary()?.totalTickets || 0 }}</h3>
              </div>
              <div class="icon-shape bg-primary-subtle text-primary rounded-3 p-3">
                <i class="bi bi-ticket-detailed fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl">
          <div class="card glass-card border-0 p-3 h-100 border-start border-4 border-info">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="text-muted small fw-semibold text-uppercase">Open Tickets</span>
                <h3 class="fw-bold text-info mt-2 mb-0">{{ summary()?.openTickets || 0 }}</h3>
              </div>
              <div class="icon-shape bg-info-subtle text-info rounded-3 p-3">
                <i class="bi bi-folder2-open fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl">
          <div class="card glass-card border-0 p-3 h-100 border-start border-4 border-warning">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="text-muted small fw-semibold text-uppercase">In Progress</span>
                <h3 class="fw-bold text-warning mt-2 mb-0">{{ summary()?.inProgressTickets || 0 }}</h3>
              </div>
              <div class="icon-shape bg-warning-subtle text-warning rounded-3 p-3">
                <i class="bi bi-hourglass-split fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl">
          <div class="card glass-card border-0 p-3 h-100 border-start border-4 border-success">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="text-muted small fw-semibold text-uppercase">Resolved</span>
                <h3 class="fw-bold text-success mt-2 mb-0">{{ summary()?.resolvedTickets || 0 }}</h3>
              </div>
              <div class="icon-shape bg-success-subtle text-success rounded-3 p-3">
                <i class="bi bi-check-circle fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl">
          <div class="card glass-card border-0 p-3 h-100 border-start border-4 border-secondary">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="text-muted small fw-semibold text-uppercase">Closed</span>
                <h3 class="fw-bold text-secondary mt-2 mb-0">{{ summary()?.closedTickets || 0 }}</h3>
              </div>
              <div class="icon-shape bg-secondary-subtle text-secondary rounded-3 p-3">
                <i class="bi bi-archive fs-3"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts & Breakdown Section -->
      <div class="row g-4 mb-4">
        <!-- Priority Chart -->
        <div class="col-12 col-lg-6">
          <div class="card glass-card border-0 p-4 h-100">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h5 class="fw-bold text-dark m-0"><i class="bi bi-bar-chart-fill me-2 text-primary"></i>Tickets by Priority</h5>
              <span class="badge bg-light text-dark border">Real-time</span>
            </div>
            
            <div class="priority-list d-flex flex-column gap-3 mt-3">
              @for (item of summary()?.ticketsByPriority; track item.priority) {
                <div>
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-semibold small text-secondary">{{ item.priority }}</span>
                    <span class="badge rounded-pill bg-light text-dark border">{{ item.count }} Tickets</span>
                  </div>
                  <div class="progress" style="height: 10px;">
                    <div 
                      class="progress-bar rounded-pill" 
                      [ngClass]="getPriorityProgressClass(item.priority)"
                      [style.width.%]="calcPercentage(item.count, summary()?.totalTickets)"
                    ></div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Category Breakdown -->
        <div class="col-12 col-lg-6">
          <div class="card glass-card border-0 p-4 h-100">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h5 class="fw-bold text-dark m-0"><i class="bi bi-pie-chart-fill me-2 text-info"></i>Tickets by Category</h5>
              <span class="badge bg-light text-dark border">Metrics</span>
            </div>

            <div class="category-list d-flex flex-column gap-3 mt-3">
              @for (cat of summary()?.ticketsByCategory; track cat.category) {
                <div>
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-semibold small text-secondary">{{ cat.category }}</span>
                    <span class="badge rounded-pill bg-light text-dark border">{{ cat.count }} Tickets</span>
                  </div>
                  <div class="progress" style="height: 10px;">
                    <div 
                      class="progress-bar bg-info rounded-pill" 
                      [style.width.%]="calcPercentage(cat.count, summary()?.totalTickets)"
                    ></div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Tickets Table -->
      <div class="card glass-card border-0 p-4">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="fw-bold text-dark m-0"><i class="bi bi-clock-history me-2 text-primary"></i>Recent Support Tickets</h5>
          <a routerLink="/tickets" class="btn btn-outline-primary btn-sm rounded-pill px-3">View All Tickets</a>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created Date</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (ticket of recentTickets(); track ticket.id) {
                <tr>
                  <td class="fw-bold text-primary">#{{ ticket.id }}</td>
                  <td class="fw-semibold text-dark">{{ ticket.title }}</td>
                  <td><span class="badge bg-light text-dark border">{{ ticket.categoryName }}</span></td>
                  <td>
                    <span [ngClass]="getPriorityBadgeClass(ticket.priorityName)">{{ ticket.priorityName }}</span>
                  </td>
                  <td>
                    <span [ngClass]="getStatusBadgeClass(ticket.statusName)">{{ ticket.statusName }}</span>
                  </td>
                  <td class="small text-muted">{{ ticket.createdDate | date:'mediumDate' }}</td>
                  <td class="text-end">
                    <a [routerLink]="['/tickets', ticket.id]" class="btn btn-sm btn-light border me-1" title="View Details">
                      <i class="bi bi-eye text-primary"></i>
                    </a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center text-muted py-4">No recent tickets available.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .icon-shape {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class DashboardComponent implements OnInit {
  summary = signal<DashboardSummary | null>(null);
  recentTickets = signal<Ticket[]>([]);

  constructor(
    private dashboardService: DashboardService,
    private ticketService: TicketService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadRecentTickets();
  }

  loadSummary(): void {
    this.dashboardService.getDashboardSummary().subscribe({
      next: (res) => this.summary.set(res),
      error: (err) => console.error('Failed to load dashboard summary', err)
    });
  }

  loadRecentTickets(): void {
    this.ticketService.getTickets({ pageSize: 5, pageNumber: 1 }).subscribe({
      next: (res) => this.recentTickets.set(res.data),
      error: (err) => console.error('Failed to load recent tickets', err)
    });
  }

  calcPercentage(count: number, total: number | undefined): number {
    if (!total || total === 0) return 0;
    return Math.round((count / total) * 100);
  }

  getPriorityProgressClass(priority: string): string {
    switch (priority) {
      case 'Critical': return 'bg-danger';
      case 'High': return 'bg-warning';
      case 'Medium': return 'bg-primary';
      default: return 'bg-success';
    }
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'Critical': return 'badge badge-status badge-critical';
      case 'High': return 'badge badge-status badge-high';
      case 'Medium': return 'badge badge-status badge-medium';
      default: return 'badge badge-status badge-low';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Open': return 'badge badge-status badge-open';
      case 'InProgress': return 'badge badge-status badge-in-progress';
      case 'Resolved': return 'badge badge-status badge-resolved';
      default: return 'badge badge-status badge-closed';
    }
  }
}
