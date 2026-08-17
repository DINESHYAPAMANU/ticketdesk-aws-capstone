import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container d-flex align-items-center justify-content-center min-vh-100 bg-dark-gradient py-5">
      <div class="card glass-card shadow-lg border-0 rounded-4 overflow-hidden col-11 col-sm-9 col-md-7 col-lg-5 col-xl-4 p-4 p-sm-5">
        <div class="text-center mb-4">
          <div class="brand-logo mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center bg-primary text-white shadow">
            <i class="bi bi-shield-lock-fill fs-2"></i>
          </div>
          <h3 class="fw-bold text-slate-800 mb-1">Welcome Back</h3>
          <p class="text-muted small">Sign in to your TicketDesk support portal</p>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-danger alert-dismissible fade show rounded-3 small mb-4" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ errorMessage() }}
            <button type="button" class="btn-close" (click)="errorMessage.set(null)"></button>
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
          <div class="mb-3">
            <label for="email" class="form-label fw-semibold text-secondary small">Email Address</label>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-envelope"></i></span>
              <input 
                type="email" 
                id="email" 
                formControlName="email" 
                class="form-control bg-light border-start-0 py-2" 
                placeholder="name@company.com"
                [ngClass]="{ 'is-invalid': submitted && f['email'].errors }"
              >
            </div>
            @if (submitted && f['email'].errors) {
              <div class="invalid-feedback d-block mt-1">
                @if (f['email'].errors['required']) { <span>Email address is required.</span> }
                @if (f['email'].errors['email']) { <span>Please enter a valid email address.</span> }
              </div>
            }
          </div>

          <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <label for="password" class="form-label fw-semibold text-secondary small mb-0">Password</label>
              <button type="button" class="btn btn-link text-decoration-none p-0 small text-primary" (click)="onForgotPassword()">
                Forgot Password?
              </button>
            </div>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-key"></i></span>
              <input 
                [type]="showPassword() ? 'text' : 'password'" 
                id="password" 
                formControlName="password" 
                class="form-control bg-light border-start-0 border-end-0 py-2" 
                placeholder="••••••••"
                [ngClass]="{ 'is-invalid': submitted && f['password'].errors }"
              >
              <button 
                type="button" 
                class="btn btn-light border border-start-0 text-muted" 
                (click)="showPassword.set(!showPassword())"
                tabindex="-1"
              >
                <i class="bi" [ngClass]="showPassword() ? 'bi-eye-slash' : 'bi-eye'"></i>
              </button>
            </div>
            @if (submitted && f['password'].errors) {
              <div class="invalid-feedback d-block mt-1">
                @if (f['password'].errors['required']) { <span>Password is required.</span> }
              </div>
            }
          </div>

          <div class="form-check mb-4">
            <input type="checkbox" id="rememberMe" formControlName="rememberMe" class="form-check-input">
            <label for="rememberMe" class="form-check-label text-muted small">Remember me on this device</label>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary w-100 py-2.5 fw-semibold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
            [disabled]="loading()"
          >
            @if (loading()) {
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>Authenticating...</span>
            } @else {
              <span>Sign In</span>
              <i class="bi bi-arrow-right"></i>
            }
          </button>
        </form>

        <div class="text-center mt-4 pt-3 border-top">
          <p class="text-muted small mb-0">
            Don't have an account? 
            <a routerLink="/register" class="text-primary text-decoration-none fw-semibold">Register Now</a>
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
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  loading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [true]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage.set(null);

    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);

    this.authService.login({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid email or password. Please try again.');
      }
    });
  }

  onForgotPassword(): void {
    alert('Please contact your System Administrator (admin@ticketdesk.com) to reset your password.');
  }
}
