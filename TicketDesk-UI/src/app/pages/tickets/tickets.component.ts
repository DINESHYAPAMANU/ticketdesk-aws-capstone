import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { Ticket, Category, Priority, Status, TicketSearchFilter } from '../../models/ticket.model';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="tickets-page py-2">
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 class="fw-bold text-dark m-0">Support Tickets</h2>
          <p class="text-muted small mb-0">Manage, filter, search, and track all IT support tickets</p>
        </div>
        <a routerLink="/tickets/create" class="btn btn-primary rounded-pill shadow-sm d-flex align-items-center gap-2">
          <i class="bi bi-plus-lg"></i>
          <span>Create New Ticket</span>
        </a>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="card glass-card border-0 p-3 mb-4">
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-search"></i></span>
              <input 
                type="text" 
                class="form-control bg-light border-start-0 py-2" 
                placeholder="Search by title or description..." 
                [(ngModel)]="searchQuery" 
                (keyup.enter)="applyFilters()"
              >
            </div>
          </div>

          <div class="col-6 col-md-2">
            <select class="form-select bg-light py-2" [(ngModel)]="selectedCategory" (change)="applyFilters()">
              <option value="">All Categories</option>
              @for (cat of categories; track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
          </div>

          <div class="col-6 col-md-2">
            <select class="form-select bg-light py-2" [(ngModel)]="selectedPriority" (change)="applyFilters()">
              <option value="">All Priorities</option>
              @for (p of priorities; track p) {
                <option [value]="p">{{ p }}</option>
              }
            </select>
          </div>

          <div class="col-6 col-md-2">
            <select class="form-select bg-light py-2" [(ngModel)]="selectedStatus" (change)="applyFilters()">
              <option value="">All Statuses</option>
              @for (s of statuses; track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
          </div>

          <div class="col-6 col-md-2 d-flex gap-2">
            <button type="button" class="btn btn-primary w-100 py-2" (click)="applyFilters()">Filter</button>
            <button type="button" class="btn btn-light border py-2" (click)="resetFilters()" title="Reset Filters">
              <i class="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Tickets Data Table -->
      <div class="card glass-card border-0 p-4">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Ticket ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Assigned To</th>
                <th>Date</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (ticket of tickets(); track ticket.id) {
                <tr>
                  <td class="fw-bold text-primary">#{{ ticket.id }}</td>
                  <td>
                    <a [routerLink]="['/tickets', ticket.id]" class="fw-semibold text-dark text-decoration-none hover-primary">
                      {{ ticket.title }}
                    </a>
                  </td>
                  <td><span class="badge bg-light text-dark border">{{ ticket.categoryName }}</span></td>
                  <td>
                    <span [ngClass]="getPriorityBadgeClass(ticket.priorityName)">{{ ticket.priorityName }}</span>
                  </td>
                  <td>
                    <span [ngClass]="getStatusBadgeClass(ticket.statusName)">{{ ticket.statusName }}</span>
                  </td>
                  <td class="small">{{ ticket.createdByName }}</td>
                  <td class="small text-muted">{{ ticket.assignedToName || 'Unassigned' }}</td>
                  <td class="small text-muted">{{ ticket.createdDate | date:'mediumDate' }}</td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                      <a [routerLink]="['/tickets', ticket.id]" class="btn btn-light border" title="View Details">
                        <i class="bi bi-eye text-primary"></i>
                      </a>
                      <a [routerLink]="['/tickets', ticket.id, 'edit']" class="btn btn-light border" title="Edit Ticket">
                        <i class="bi bi-pencil text-warning"></i>
                      </a>
                      @if (authService.isAdmin()) {
                        <button type="button" class="btn btn-light border text-danger" (click)="onDeleteTicket(ticket.id)" title="Delete Ticket">
                          <i class="bi bi-trash"></i>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="text-center text-muted py-5">
                    <i class="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                    No tickets found matching your filter criteria.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 mt-4 pt-3 border-top">
          <span class="small text-muted">
            Showing Page <strong>{{ pageNumber() }}</strong> of <strong>{{ totalPages() }}</strong> (Total: {{ totalCount() }} tickets)
          </span>

          <div class="btn-group">
            <button 
              type="button" 
              class="btn btn-outline-secondary btn-sm" 
              [disabled]="pageNumber() === 1"
              (click)="changePage(pageNumber() - 1)"
            >
              <i class="bi bi-chevron-left"></i> Previous
            </button>
            <button 
              type="button" 
              class="btn btn-outline-secondary btn-sm" 
              [disabled]="pageNumber() >= totalPages()"
              (click)="changePage(pageNumber() + 1)"
            >
              Next <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hover-primary:hover {
      color: #2563eb !important;
    }
  `]
})
export class TicketsComponent implements OnInit {
  tickets = signal<Ticket[]>([]);
  totalCount = signal<number>(0);
  totalPages = signal<number>(1);
  pageNumber = signal<number>(1);
  pageSize = signal<number>(10);

  searchQuery = '';
  selectedCategory = '';
  selectedPriority = '';
  selectedStatus = '';

  categories = Object.values(Category);
  priorities = Object.values(Priority);
  statuses = Object.values(Status);

  constructor(
    private ticketService: TicketService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    const filter: TicketSearchFilter = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
      searchQuery: this.searchQuery || undefined,
      category: (this.selectedCategory as Category) || undefined,
      priority: (this.selectedPriority as Priority) || undefined,
      status: (this.selectedStatus as Status) || undefined
    };

    this.ticketService.getTickets(filter).subscribe({
      next: (res) => {
        this.tickets.set(res.data);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages || 1);
      },
      error: (err) => console.error('Failed to load tickets', err)
    });
  }

  applyFilters(): void {
    this.pageNumber.set(1);
    this.loadTickets();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedPriority = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.pageNumber.set(newPage);
      this.loadTickets();
    }
  }

  onDeleteTicket(id: number): void {
    if (confirm(`Are you sure you want to delete Ticket #${id}?`)) {
      this.ticketService.deleteTicket(id).subscribe({
        next: () => this.loadTickets(),
        error: (err) => alert(err.error?.message || 'Failed to delete ticket.')
      });
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
