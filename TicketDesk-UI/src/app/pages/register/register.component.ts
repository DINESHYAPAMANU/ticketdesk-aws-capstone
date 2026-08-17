import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container d-flex align-items-center justify-content-center min-vh-100 bg-dark-gradient py-5">
      <div class="card glass-card shadow-lg border-0 rounded-4 overflow-hidden col-11 col-sm-10 col-md-8 col-lg-6 col-xl-5 p-4 p-sm-5">
        <div class="text-center mb-4">
          <div class="brand-logo mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center bg-primary text-white shadow">
            <i class="bi bi-person-plus-fill fs-2"></i>
          </div>
          <h3 class="fw-bold text-slate-800 mb-1">Create Account</h3>
          <p class="text-muted small">Join TicketDesk support management platform</p>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-danger alert-dismissible fade show rounded-3 small mb-4" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ errorMessage() }}
            <button type="button" class="btn-close" (click)="errorMessage.set(null)"></button>
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" novalidate>
          <div class="row g-3 mb-3">
            <div class="col-sm-6">
              <label for="firstName" class="form-label fw-semibold text-secondary small">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                formControlName="firstName" 
                class="form-control bg-light py-2" 
                placeholder="John"
                [ngClass]="{ 'is-invalid': submitted && f['firstName'].errors }"
              >
              @if (submitted && f['firstName'].errors) {
                <div class="invalid-feedback d-block mt-1">First name is required.</div>
              }
            </div>

            <div class="col-sm-6">
              <label for="lastName" class="form-label fw-semibold text-secondary small">Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                formControlName="lastName" 
                class="form-control bg-light py-2" 
                placeholder="Doe"
                [ngClass]="{ 'is-invalid': submitted && f['lastName'].errors }"
              >
              @if (submitted && f['lastName'].errors) {
                <div class="invalid-feedback d-block mt-1">Last name is required.</div>
              }
            </div>
          </div>

          <div class="mb-3">
            <label for="email" class="form-label fw-semibold text-secondary small">Email Address</label>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-envelope"></i></span>
              <input 
                type="email" 
                id="email" 
                formControlName="email" 
                class="form-control bg-light border-start-0 py-2" 
                placeholder="john.doe@company.com"
                [ngClass]="{ 'is-invalid': submitted && f['email'].errors }"
              >
            </div>
            @if (submitted && f['email'].errors) {
              <div class="invalid-feedback d-block mt-1">
                @if (f['email'].errors['required']) { <span>Email is required.</span> }
                @if (f['email'].errors['email']) { <span>Enter a valid email address.</span> }
              </div>
            }
          </div>

          <div class="row g-3 mb-4">
            <div class="col-sm-6">
              <label for="password" class="form-label fw-semibold text-secondary small">Password</label>
              <div class="input-group">
                <input 
                  [type]="showPassword() ? 'text' : 'password'" 
                  id="password" 
                  formControlName="password" 
                  class="form-control bg-light border-end-0 py-2" 
                  placeholder="••••••••"
                  [ngClass]="{ 'is-invalid': submitted && f['password'].errors }"
                >
                <button type="button" class="btn btn-light border border-start-0 text-muted" (click)="showPassword.set(!showPassword())">
                  <i class="bi" [ngClass]="showPassword() ? 'bi-eye-slash' : 'bi-eye'"></i>
                </button>
              </div>
              @if (submitted && f['password'].errors) {
                <div class="invalid-feedback d-block mt-1">
                  @if (f['password'].errors['required']) { <span>Password required.</span> }
                  @if (f['password'].errors['minlength']) { <span>Min 6 characters.</span> }
                </div>
              }
            </div>

            <div class="col-sm-6">
              <label for="confirmPassword" class="form-label fw-semibold text-secondary small">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                formControlName="confirmPassword" 
                class="form-control bg-light py-2" 
                placeholder="••••••••"
                [ngClass]="{ 'is-invalid': submitted && (f['confirmPassword'].errors || registerForm.hasError('mismatch')) }"
              >
              @if (submitted && (f['confirmPassword'].errors || registerForm.hasError('mismatch'))) {
                <div class="invalid-feedback d-block mt-1">Passwords do not match.</div>
              }
            </div>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary w-100 py-2.5 fw-semibold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
            [disabled]="loading()"
          >
            @if (loading()) {
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>Registering Account...</span>
            } @else {
              <span>Create Account</span>
              <i class="bi bi-check-circle"></i>
            }
          </button>
        </form>

        <div class="text-center mt-4 pt-3 border-top">
          <p class="text-muted small mb-0">
            Already have an account? 
            <a routerLink="/login" class="text-primary text-decoration-none fw-semibold">Sign In Here</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-dark-gradient {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
    }
    .brand-logo {
      width: 60px;
      height: 60px;
    }
    .text-slate-800 {
      color: #1e293b;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  submitted = false;
  loading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: [Role.Employee],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  get f() {
    return this.registerForm.controls;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword ? { mismatch: true } : null;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage.set(null);

    if (this.registerForm.invalid) {
      return;
    }

    this.loading.set(true);

    this.authService.register({
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      role: Role.Employee,
      password: this.registerForm.value.password
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Registration failed. Email may already be in use.');
      }
    });
  }
}
