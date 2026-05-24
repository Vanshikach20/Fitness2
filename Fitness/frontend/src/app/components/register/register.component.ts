import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  alertMessage: string | null = null;
  alertClass = 'alert-danger';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    this.registerForm = this.fb.group({
      fullName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z\s]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100)
      ]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  get passwordMismatch(): boolean {
    const pw = this.registerForm.get('password')?.value;
    const cpw = this.registerForm.get('confirmPassword')?.value;
    return cpw && pw !== cpw;
  }

  /* Password strength checks */
  get pwValue(): string { return this.registerForm.get('password')?.value || ''; }
  get hasUppercase(): boolean { return /[A-Z]/.test(this.pwValue); }
  get hasLowercase(): boolean { return /[a-z]/.test(this.pwValue); }
  get hasDigit(): boolean { return /\d/.test(this.pwValue); }
  get hasSpecial(): boolean { return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.pwValue); }
  get hasMinLength(): boolean { return this.pwValue.length >= 8; }
  get isPasswordStrong(): boolean {
    return this.hasUppercase && this.hasLowercase && this.hasDigit && this.hasSpecial && this.hasMinLength;
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.passwordMismatch || !this.isPasswordStrong) return;
    this.isSubmitting = true;
    this.alertMessage = null;

    const { fullName, email, password } = this.registerForm.value;

    this.authService.register({ fullName, email, password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.alertMessage = err.error?.message || 'Registration failed. Please try again.';
        this.alertClass = 'alert-danger';
        this.isSubmitting = false;
      }
    });
  }
}
