import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-page py-2 col-12 col-lg-8 col-xl-7 mx-auto">
      <div class="mb-4">
        <h2 class="fw-bold text-dark m-0">User Profile & Settings</h2>
        <p class="text-muted small mb-0">View account details and update your security credentials</p>
      </div>

      @if (successMessage()) {
        <div class="alert alert-success alert-dismissible fade show rounded-3 small mb-4" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i> {{ successMessage() }}
          <button type="button" class="btn-close" (click)="successMessage.set(null)"></button>
        </div>
      }

      @if (errorMessage()) {
        <div class="alert alert-danger alert-dismissible fade show rounded-3 small mb-4" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ errorMessage() }}
          <button type="button" class="btn-close" (click)="errorMessage.set(null)"></button>
        </div>
      }

      <div class="card glass-card border-0 p-4 mb-4">
        <div class="d-flex align-items-center gap-4">
          <div class="avatar-large bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-2 shadow">
            {{ userInitials() }}
          </div>
          <div>
            <h4 class="fw-bold text-dark mb-1">{{ userFullName() }}</h4>
            <p class="text-muted small mb-2"><i class="bi bi-envelope me-1"></i> {{ userEmail() }}</p>
            <span class="badge bg-primary-subtle text-primary border px-3 py-1 rounded-pill fw-semibold fs-xs">
              <i class="bi bi-shield-check me-1"></i> {{ userRole() }} Role
            </span>
          </div>
        </div>
      </div>

      <!-- Change Password Form Card -->
      <div class="card glass-card border-0 p-4 p-md-5">
        <h5 class="fw-bold text-dark mb-3">
          <i class="bi bi-key-fill me-2 text-primary"></i> Change Password
        </h5>

        <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" novalidate>
          <div class="mb-3">
            <label for="currentPassword" class="form-label fw-semibold text-secondary small">Current Password</label>
            <input 
              type="password" 
              id="currentPassword" 
              formControlName="currentPassword" 
              class="form-control py-2" 
              placeholder="••••••••"
              [ngClass]="{ 'is-invalid': submitted && f['currentPassword'].errors }"
            >
            @if (submitted && f['currentPassword'].errors) {
              <div class="invalid-feedback">Current password is required.</div>
            }
          </div>

          <div class="row g-3 mb-4">
            <div class="col-sm-6">
              <label for="newPassword" class="form-label fw-semibold text-secondary small">New Password</label>
              <input 
                type="password" 
                id="newPassword" 
                formControlName="newPassword" 
                class="form-control py-2" 
                placeholder="••••••••"
                [ngClass]="{ 'is-invalid': submitted && f['newPassword'].errors }"
              >
              @if (submitted && f['newPassword'].errors) {
                <div class="invalid-feedback">
                  @if (f['newPassword'].errors['required']) { <span>New password is required.</span> }
                  @if (f['newPassword'].errors['minlength']) { <span>Must be at least 6 characters.</span> }
                </div>
              }
            </div>

            <div class="col-sm-6">
              <label for="confirmNewPassword" class="form-label fw-semibold text-secondary small">Confirm New Password</label>
              <input 
                type="password" 
                id="confirmNewPassword" 
                formControlName="confirmNewPassword" 
                class="form-control py-2" 
                placeholder="••••••••"
                [ngClass]="{ 'is-invalid': submitted && (f['confirmNewPassword'].errors || passwordForm.hasError('mismatch')) }"
              >
              @if (submitted && (f['confirmNewPassword'].errors || passwordForm.hasError('mismatch'))) {
                <div class="invalid-feedback">Passwords do not match.</div>
              }
            </div>
          </div>

          <div class="d-flex justify-content-end pt-3 border-top">
            <button 
              type="submit" 
              class="btn btn-primary px-4 py-2 fw-semibold d-flex align-items-center gap-2"
              [disabled]="loading()"
            >
              @if (loading()) {
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Updating Password...</span>
              } @else {
                <i class="bi bi-shield-lock"></i>
                <span>Update Password</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .avatar-large {
      width: 72px;
      height: 72px;
    }
    .fs-xs {
      font-size: 0.75rem;
    }
  `]
})
export class ProfileComponent {
  passwordForm: FormGroup;
  submitted = false;
  loading = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  get f() {
    return this.passwordForm.controls;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmNewPassword')?.value;
    return password && confirmPassword && password !== confirmPassword ? { mismatch: true } : null;
  }

  userFullName(): string {
    return this.authService.currentUser()?.fullName || 'User Account';
  }

  userEmail(): string {
    return this.authService.currentUser()?.email || 'user@company.com';
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

  onChangePassword(): void {
    this.submitted = true;
    this.successMessage.set(null);
    this.errorMessage.set(null);

    if (this.passwordForm.invalid) {
      return;
    }

    this.loading.set(true);

    this.authService.changePassword({
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted = false;
        this.passwordForm.reset();
        this.successMessage.set('Password updated successfully!');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to update password. Please check your current password.');
      }
    });
  }
}
