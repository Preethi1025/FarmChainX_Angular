import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class RegisterComponent {

  /* ---------------- FORM STATE ---------------- */
  form = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'FARMER'
  };

  errors: any = {};
  loading = false;
  checkingEmail = false;

  showPassword = false;
  showConfirmPassword = false;

  private emailTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /* ---------------- VALIDATION ---------------- */

  validateName() {
    this.errors.name =
      this.form.name.trim().length < 3
        ? 'Name must be at least 3 characters.'
        : '';
  }

  validateEmail() {
  const email = this.form.email.trim();

  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Basic format check
  if (!emailRegex.test(email)) {
    this.errors.email = 'Enter a valid email address.';
    return;
  }

  // Optional: block common disposable domains
  const blockedDomains = [
    'tempmail.com',
    '10minutemail.com',
    'mailinator.com',
    'guerrillamail.com'
  ];

  const domain = email.split('@')[1]?.toLowerCase();

  if (blockedDomains.includes(domain)) {
    this.errors.email = 'Disposable email addresses are not allowed.';
    return;
  }

  // ✅ valid so far
  this.errors.email = '';
}


  validatePassword() {
    const p = this.form.password;

    if (p.length < 8)
      this.errors.password = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(p))
      this.errors.password = 'Must include an uppercase letter.';
    else if (!/[a-z]/.test(p))
      this.errors.password = 'Must include a lowercase letter.';
    else if (!/[0-9]/.test(p))
      this.errors.password = 'Must include a number.';
    else if (!/[!@#$%^&*(),.?:{}|<>]/.test(p))
      this.errors.password = 'Must include a special character.';
    else
      this.errors.password = '';

    this.validateConfirmPassword();
  }

  validateConfirmPassword() {
    this.errors.confirmPassword =
      this.form.confirmPassword !== this.form.password
        ? 'Passwords do not match.'
        : '';
  }

  validatePhone() {
    const phoneRegex = /^[6-9]\d{9}$/;
    this.errors.phone = phoneRegex.test(this.form.phone)
      ? ''
      : 'Enter a valid 10-digit mobile number.';
  }

  /* ---------------- EMAIL CHECK ---------------- */

  onEmailChange() {
    this.validateEmail();

    if (this.emailTimer) {
      clearTimeout(this.emailTimer);
    }

    if (!this.errors.email) {
      this.emailTimer = setTimeout(() => {
        this.checkEmailExists();
      }, 600);
    }
  }

  async checkEmailExists() {
    this.checkingEmail = true;
    try {
      const res: any = await this.http.get(
        'http://localhost:8080/api/auth/check-email',
        { params: { email: this.form.email } }
      ).toPromise();

      if (res?.exists) {
        this.errors.email = 'An account with this email already exists.';
      }
    } finally {
      this.checkingEmail = false;
    }
  }

  /* ---------------- HELPERS ---------------- */

  setRole(role: 'FARMER' | 'BUYER' | 'DISTRIBUTOR') {
    this.form.role = role;
  }

  isFormValid(): boolean {
    return (
      Object.values(this.form).every(v => String(v).trim() !== '') &&
      Object.values(this.errors).every(e => !e)
    );
  }

  /* ---------------- SUBMIT ---------------- */

  async handleSubmit() {
    if (!this.isFormValid()) return;

    this.loading = true;
    try {
      await this.http
        .post('http://localhost:8080/api/auth/register', this.form)
        .toPromise();

      this.router.navigate(['/login']);
    } finally {
      this.loading = false;
    }
  }
}
