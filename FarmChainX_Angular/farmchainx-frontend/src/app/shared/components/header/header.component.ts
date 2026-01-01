import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotificationBellComponent
  ],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {

  isMenuOpen = false;
  user: any = null;
  currentPath = '';

  @Input() showPageTitle: boolean = true;

  navigation = [
    { name: 'Marketplace', href: '/marketplace' },
  ];

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Listen for auth changes
    this.auth.user$.subscribe(user => {
      this.user = user;
    });

    // Track current route
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentPath = event.urlAfterRedirects;
        this.isMenuOpen = false;
      }
    });
  }

  /* ---------------- ROLE BASED NAV ---------------- */
  getRoleNav() {
    if (!this.user) return [];

    switch (this.user.role) {
      case 'ADMIN':
        return [{ name: 'Dashboard', href: '/admin/dashboard' }];

      case 'FARMER':
        return [{ name: 'Dashboard', href: '/farmer' }];

      case 'BUYER':
        return [{ name: 'Dashboard', href: '/consumer' }];

      case 'DISTRIBUTOR':
        return [{ name: 'Dashboard', href: '/distributor' }];

      default:
        return [];
    }
  }

  /* ---------------- FARMER AI ---------------- */
  goToKisanAI(): void {
    this.router.navigate(['/farmer/ai-assistant']);
  }

  /* ---------------- LOGOUT ---------------- */
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
