import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  showPassword = false;
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;
    this.error = '';
    this.loading = true;

    const { email, password } = this.loginForm.value;

    try {
      // AuthService.login() is assumed to return a Promise
      const response: any = await this.auth.login(email, password);

      // Normalize user object
      const loggedUser = response.user ?? response;

      if (!loggedUser) {
        this.error = "Invalid login response";
        this.loading = false;
        return;
      }

      const { id, role, name, email: userEmail } = loggedUser;

      if (!id || !role) {
        this.error = "Login failed: missing user data";
        this.loading = false;
        return;
      }

      // Store user info in localStorage
      localStorage.setItem('userId', id);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', userEmail);
      console.log(role);

      // Navigate based on role
      switch (role) {
        case 'BUYER':
          this.router.navigate(['/consumer-dashboard']);
          break;
        case 'FARMER':
          this.router.navigate(['/farmer-dashboard']);
          break;
        case 'DISTRIBUTOR':
          this.router.navigate(['/distributor-dashboard']);
          break;
          
        default:
          this.router.navigate(['/']);
      }

    } catch (err) {
      console.error('Login failed:', err);
      this.error = 'Login failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
