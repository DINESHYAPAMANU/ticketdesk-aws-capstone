import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { AttachmentService } from '../../services/attachment.service';
import { Category, Priority } from '../../models/ticket.model';

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="create-ticket-page py-2 col-12 col-lg-9 col-xl-8 mx-auto">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 class="fw-bold text-dark m-0">Create New Support Ticket</h2>
          <p class="text-muted small mb-0">Fill in the details below to submit a technical support request</p>
        </div>
        <a routerLink="/tickets" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i class="bi bi-arrow-left me-1"></i> Back to Tickets
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
            <label for="title" class="form-label fw-semibold text-secondary">Ticket Title <span class="text-danger">*</span></label>
            <input 
              type="text" 
              id="title" 
              formControlName="title" 
              class="form-control py-2" 
              placeholder="e.g. Cannot connect to VPN server from remote office"
              [ngClass]="{ 'is-invalid': submitted && f['title'].errors }"
            >
            @if (submitted && f['title'].errors) {
              <div class="invalid-feedback">Title is required (max 150 characters).</div>
            }
          </div>

          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label for="category" class="form-label fw-semibold text-secondary">Category <span class="text-danger">*</span></label>
              <select id="category" formControlName="category" class="form-select py-2" [ngClass]="{ 'is-invalid': submitted && f['category'].errors }">
                <option value="" disabled>Select Category</option>
                @for (cat of categories; track cat) {
                  <option [value]="cat">{{ cat }}</option>
                }
              </select>
              @if (submitted && f['category'].errors) {
                <div class="invalid-feedback">Category selection is required.</div>
              }
            </div>

            <div class="col-md-6">
              <label for="priority" class="form-label fw-semibold text-secondary">Priority Level <span class="text-danger">*</span></label>
              <select id="priority" formControlName="priority" class="form-select py-2" [ngClass]="{ 'is-invalid': submitted && f['priority'].errors }">
                <option value="" disabled>Select Priority</option>
                @for (p of priorities; track p) {
                  <option [value]="p">{{ p }}</option>
                }
              </select>
              @if (submitted && f['priority'].errors) {
                <div class="invalid-feedback">Priority level selection is required.</div>
              }
            </div>
          </div>

          <div class="mb-4">
            <label for="description" class="form-label fw-semibold text-secondary">Detailed Description <span class="text-danger">*</span></label>
            <textarea 
              id="description" 
              formControlName="description" 
              rows="5" 
              class="form-control" 
              placeholder="Describe the issue, error messages, step-by-step impact..."
              [ngClass]="{ 'is-invalid': submitted && f['description'].errors }"
            ></textarea>
            @if (submitted && f['description'].errors) {
              <div class="invalid-feedback">Description is required.</div>
            }
          </div>

          <div class="mb-4">
            <label for="file" class="form-label fw-semibold text-secondary">Attach Log or File (Optional)</label>
            <input type="file" id="file" class="form-control" (change)="onFileSelected($event)">
            <span class="form-text text-muted small">Supports documents, screenshots, and logs (PDF, PNG, JPG, TXT).</span>
          </div>

          <div class="d-flex align-items-center justify-content-end gap-3 pt-3 border-top">
            <button type="button" class="btn btn-light border px-4 py-2" (click)="onReset()">Reset Form</button>
            <button 
              type="submit" 
              class="btn btn-primary px-4 py-2 fw-semibold d-flex align-items-center gap-2"
              [disabled]="loading()"
            >
              @if (loading()) {
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Submitting...</span>
              } @else {
                <i class="bi bi-send-fill"></i>
                <span>Submit Ticket</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CreateTicketComponent {
  categories = Object.values(Category);
  priorities = Object.values(Priority);
  ticketForm: FormGroup;
  submitted = false;
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private attachmentService: AttachmentService,
    private router: Router
  ) {
    this.ticketForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(150)]],
      category: [Category.Bug, [Validators.required]],
      priority: [Priority.Medium, [Validators.required]],
      description: ['', [Validators.required]]
    });
  }

  get f() {
    return this.ticketForm.controls;
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage.set(null);

    if (this.ticketForm.invalid) {
      return;
    }

    this.loading.set(true);

    this.ticketService.createTicket({
      title: this.ticketForm.value.title,
      category: this.ticketForm.value.category,
      priority: this.ticketForm.value.priority,
      description: this.ticketForm.value.description
    }).subscribe({
      next: (ticket) => {
        if (this.selectedFile) {
          this.attachmentService.uploadAttachment(ticket.id, this.selectedFile).subscribe({
            next: () => {
              this.loading.set(false);
              this.router.navigate(['/tickets', ticket.id]);
            },
            error: (err) => {
              this.loading.set(false);
              console.error('Attachment upload failed', err);
              this.router.navigate(['/tickets', ticket.id]);
            }
          });
        } else {
          this.loading.set(false);
          this.router.navigate(['/tickets', ticket.id]);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to create support ticket. Please check input values.');
      }
    });
  }

  onReset(): void {
    this.submitted = false;
    this.ticketForm.reset({
      category: Category.Bug,
      priority: Priority.Medium
    });
    this.selectedFile = null;
  }
}
