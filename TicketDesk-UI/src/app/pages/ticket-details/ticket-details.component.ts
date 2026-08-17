import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { AttachmentService } from '../../services/attachment.service';
import { AuthService } from '../../services/auth.service';
import { TicketDetail, Status } from '../../models/ticket.model';
import { CommentsComponent } from '../comments/comments.component';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CommentsComponent],
  template: `
    <div class="ticket-details-page py-2 col-12 col-xl-10 mx-auto">
      @if (ticket(); as t) {
        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-primary fs-6">Ticket #{{ t.id }}</span>
              <span [ngClass]="getStatusBadgeClass(t.statusName)">{{ t.statusName }}</span>
              <span [ngClass]="getPriorityBadgeClass(t.priorityName)">{{ t.priorityName }}</span>
            </div>
            <h2 class="fw-bold text-dark m-0">{{ t.title }}</h2>
          </div>

          <div class="d-flex align-items-center gap-2">
            <a [routerLink]="['/tickets', t.id, 'edit']" class="btn btn-outline-warning rounded-pill px-3">
              <i class="bi bi-pencil me-1"></i> Edit Ticket
            </a>
            <a routerLink="/tickets" class="btn btn-outline-secondary rounded-pill px-3">
              <i class="bi bi-arrow-left me-1"></i> Back to List
            </a>
          </div>
        </div>

        <!-- Lifecycle Status Stepper Bar -->
        <div class="card glass-card border-0 p-4 mb-4">
          <h6 class="fw-bold text-secondary mb-3">Ticket Resolution Lifecycle</h6>
          <div class="stepper-bar d-flex justify-content-between align-items-center position-relative">
            <div class="stepper-step text-center" [class.completed]="isStatusStepActive(t.statusName, 'Open')">
              <div class="step-icon mx-auto rounded-circle d-flex align-items-center justify-content-center">
                <i class="bi bi-folder2-open"></i>
              </div>
              <span class="small fw-semibold mt-1 d-block">Open</span>
            </div>

            <div class="stepper-step text-center" [class.completed]="isStatusStepActive(t.statusName, 'InProgress')">
              <div class="step-icon mx-auto rounded-circle d-flex align-items-center justify-content-center">
                <i class="bi bi-gear-wide-connected"></i>
              </div>
              <span class="small fw-semibold mt-1 d-block">In Progress</span>
            </div>

            <div class="stepper-step text-center" [class.completed]="isStatusStepActive(t.statusName, 'Resolved')">
              <div class="step-icon mx-auto rounded-circle d-flex align-items-center justify-content-center">
                <i class="bi bi-check-lg"></i>
              </div>
              <span class="small fw-semibold mt-1 d-block">Resolved</span>
            </div>

            <div class="stepper-step text-center" [class.completed]="isStatusStepActive(t.statusName, 'Closed')">
              <div class="step-icon mx-auto rounded-circle d-flex align-items-center justify-content-center">
                <i class="bi bi-archive"></i>
              </div>
              <span class="small fw-semibold mt-1 d-block">Closed</span>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Main Content Body -->
          <div class="col-12 col-lg-8">
            <!-- Ticket Description Card -->
            <div class="card glass-card border-0 p-4 mb-4">
              <h5 class="fw-bold text-dark mb-3">Issue Description</h5>
              <p class="text-secondary leading-relaxed whitespace-pre-line">{{ t.description }}</p>
            </div>

            <!-- Attachment Card -->
            <div class="card glass-card border-0 p-4 mb-4">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h5 class="fw-bold text-dark m-0"><i class="bi bi-paperclip me-2 text-primary"></i>Attachment</h5>
              </div>

              @if (t.attachment; as file) {
                <div class="p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center gap-3">
                    <i class="bi bi-file-earmark-zip fs-2 text-primary"></i>
                    <div>
                      <h6 class="fw-bold mb-0 text-dark">{{ file.fileName }}</h6>
                      <span class="text-muted small">{{ (file.fileSize / 1024).toFixed(1) }} KB • Uploaded {{ file.uploadedDate | date:'mediumDate' }}</span>
                    </div>
                  </div>
                  <div class="d-flex gap-2">
                    <button type="button" class="btn btn-primary btn-sm rounded-pill px-3" (click)="onDownloadFile(t.id)">
                      <i class="bi bi-download me-1"></i> Download
                    </button>
                    @if (authService.isAdmin() || t.createdById === authService.currentUser()?.userId) {
                      <button type="button" class="btn btn-outline-danger btn-sm rounded-circle p-2" (click)="onDeleteFile(t.id)" title="Delete File">
                        <i class="bi bi-trash"></i>
                      </button>
                    }
                  </div>
                </div>
              } @else {
                <div class="text-muted small">No file attached to this support ticket.</div>
              }
            </div>

            <!-- Discussion & Comments Section -->
            <div class="card glass-card border-0 p-4">
              <app-comments [ticketId]="t.id"></app-comments>
            </div>
          </div>

          <!-- Side Metadata & Assignment -->
          <div class="col-12 col-lg-4">
            <div class="card glass-card border-0 p-4 sticky-top" style="top: 80px;">
              <h5 class="fw-bold text-dark mb-3">Ticket Metadata</h5>
              
              <div class="mb-3">
                <span class="text-muted small d-block">Category</span>
                <span class="fw-semibold text-dark">{{ t.categoryName }}</span>
              </div>

              <div class="mb-3">
                <span class="text-muted small d-block">Submitted By</span>
                <span class="fw-semibold text-dark">{{ t.createdByName }}</span>
              </div>

              <div class="mb-3">
                <span class="text-muted small d-block">Created On</span>
                <span class="fw-semibold text-dark">{{ t.createdDate | date:'medium' }}</span>
              </div>

              <div class="mb-3">
                <span class="text-muted small d-block">Last Updated</span>
                <span class="fw-semibold text-dark">{{ t.updatedDate ? (t.updatedDate | date:'medium') : 'N/A' }}</span>
              </div>

              <hr>

              <!-- Assignment Section -->
              <div class="mb-3">
                <span class="text-muted small d-block mb-1">Assigned Support Staff</span>
                <span class="badge bg-secondary-subtle text-secondary border p-2 w-100 text-start">
                  <i class="bi bi-person-badge me-2"></i>
                  {{ t.assignedToName || 'Unassigned' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="text-muted mt-2">Loading ticket details...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .whitespace-pre-line {
      white-space: pre-line;
    }
    .stepper-bar .stepper-step {
      position: relative;
      z-index: 1;
      flex: 1;
    }
    .stepper-bar .step-icon {
      width: 42px;
      height: 42px;
      background-color: #e2e8f0;
      color: #64748b;
      font-size: 1.2rem;
      transition: all 0.3s ease;
    }
    .stepper-bar .stepper-step.completed .step-icon {
      background-color: #2563eb;
      color: #ffffff;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
    }
  `]
})
export class TicketDetailsComponent implements OnInit {
  ticket = signal<TicketDetail | null>(null);

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private attachmentService: AttachmentService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadTicket(+idParam);
    }
  }

  loadTicket(id: number): void {
    this.ticketService.getTicketById(id).subscribe({
      next: (data) => this.ticket.set(data),
      error: (err) => console.error('Failed to load ticket details', err)
    });
  }

  onDownloadFile(ticketId: number): void {
    this.attachmentService.downloadAttachment(ticketId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.ticket()?.attachment?.fileName || `attachment_${ticketId}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => alert('Failed to download attachment file.')
    });
  }

  onDeleteFile(ticketId: number): void {
    if (confirm('Are you sure you want to delete this file attachment?')) {
      this.attachmentService.deleteAttachment(ticketId).subscribe({
        next: () => this.loadTicket(ticketId),
        error: (err) => alert('Failed to delete attachment file.')
      });
    }
  }

  isStatusStepActive(currentStatus: string, stepStatus: string): boolean {
    const order = ['Open', 'InProgress', 'Resolved', 'Closed'];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepStatus);
    return stepIndex <= currentIndex;
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
