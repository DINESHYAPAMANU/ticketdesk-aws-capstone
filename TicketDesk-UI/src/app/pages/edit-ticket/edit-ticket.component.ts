import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { Category, Priority, Status } from '../../models/ticket.model';

@Component({
  selector: 'app-edit-ticket',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="edit-ticket-page py-2 col-12 col-lg-9 col-xl-8 mx-auto">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 class="fw-bold text-dark m-0">Edit Support Ticket #{{ ticketId() }}</h2>
          <p class="text-muted small mb-0">Update ticket priority, status, category, or description details</p>
        </div>
        <a [routerLink]="['/tickets', ticketId()]" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i class="bi bi-x-lg me-1"></i> Cancel
        </a>
      </div>

      @if (errorMessage()) {
        <div class="alert alert-danger alert-dismissible fade show rounded-3 small mb-4" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ errorMessage() }}
          <button type="button" class="btn-close" (click)="errorMessage.set(null)"></button>
        </div>
      }

      <div class="card glass-card border-0 p-4 p-md-5">
        <form [formGroup]="ticketForm" (ngSubmit)="onSubmit()" novalidate>
          <div class="mb-3">
            <label for="title" class="form-label fw-semibold text-secondary">Title <span class="text-danger">*</span></label>
            <input 
              type="text" 
              id="title" 
              formControlName="title" 
              class="form-control py-2" 
              [ngClass]="{ 'is-invalid': submitted && f['title'].errors }"
            >
            @if (submitted && f['title'].errors) {
              <div class="invalid-feedback">Title is required.</div>
            }
          </div>

          <div class="row g-3 mb-3">
            <div class="col-md-4">
              <label for="category" class="form-label fw-semibold text-secondary">Category</label>
              <select id="category" formControlName="category" class="form-select py-2">
                @for (cat of categories; track cat) {
                  <option [value]="cat">{{ cat }}</option>
                }
              </select>
            </div>

            <div class="col-md-4">
              <label for="priority" class="form-label fw-semibold text-secondary">Priority Level</label>
              <select id="priority" formControlName="priority" class="form-select py-2">
                @for (p of priorities; track p) {
                  <option [value]="p">{{ p }}</option>
                }
              </select>
            </div>

            <div class="col-md-4">
              <label for="status" class="form-label fw-semibold text-secondary">Lifecycle Status</label>
              <select id="status" formControlName="status" class="form-select py-2">
                @for (s of statuses; track s) {
                  <option [value]="s">{{ s }}</option>
                }
              </select>
            </div>
          </div>

          <div class="mb-4">
            <label for="description" class="form-label fw-semibold text-secondary">Description <span class="text-danger">*</span></label>
            <textarea 
              id="description" 
              formControlName="description" 
              rows="6" 
              class="form-control"
              [ngClass]="{ 'is-invalid': submitted && f['description'].errors }"
            ></textarea>
            @if (submitted && f['description'].errors) {
              <div class="invalid-feedback">Description is required.</div>
            }
          </div>

          <div class="d-flex align-items-center justify-content-end gap-3 pt-3 border-top">
            <a [routerLink]="['/tickets', ticketId()]" class="btn btn-light border px-4 py-2">Cancel</a>
            <button 
              type="submit" 
              class="btn btn-primary px-4 py-2 fw-semibold d-flex align-items-center gap-2"
              [disabled]="loading()"
            >
              @if (loading()) {
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Saving Changes...</span>
              } @else {
                <i class="bi bi-floppy-fill"></i>
                <span>Save Changes</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class EditTicketComponent implements OnInit {
  ticketId = signal<number>(0);
  categories = Object.values(Category);
  priorities = Object.values(Priority);
  statuses = Object.values(Status);

  ticketForm: FormGroup;
  submitted = false;
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private ticketService: TicketService
  ) {
    this.ticketForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(150)]],
      category: ['', [Validators.required]],
      priority: ['', [Validators.required]],
      status: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.ticketId.set(+idParam);
      this.loadTicketDetails(+idParam);
    }
  }

  get f() {
    return this.ticketForm.controls;
  }

  loadTicketDetails(id: number): void {
    this.ticketService.getTicketById(id).subscribe({
      next: (ticket) => {
        if (ticket) {
          this.ticketForm.patchValue({
            title: ticket.title,
            category: ticket.categoryName,
            priority: ticket.priorityName,
            status: ticket.statusName,
            description: ticket.description
          });
        }
      },
      error: (err) => {
        this.errorMessage.set('Failed to load ticket details for editing.');
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage.set(null);

    if (this.ticketForm.invalid) {
      return;
    }

    this.loading.set(true);

    this.ticketService.updateTicket(this.ticketId(), {
      title: this.ticketForm.value.title,
      category: this.ticketForm.value.category as Category,
      priority: this.ticketForm.value.priority as Priority,
      status: this.ticketForm.value.status as Status,
      description: this.ticketForm.value.description
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/tickets', this.ticketId()]);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to update ticket.');
      }
    });
  }
}
