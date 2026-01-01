// src/app/admin/admin-layout/admin-layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,                 // ✅ Provides router-outlet
    NotificationBellComponent
  ],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent {

  constructor(private router: Router) {}

  logout(): void {
    localStorage.removeItem('admin');
    this.router.navigate(['/login']);
  }

  /** Soft refresh: reloads current route without full page reload */
  refreshPage(): void {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigateByUrl(currentUrl);
    });
  }
}
