import { Component, Input, OnInit, HostListener } from '@angular/core';
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
  isProfileOpen = false;
  user: any = null;
  currentPath = '';

  @Input() showPageTitle: boolean = true;

  // BASE NAVIGATION
  baseNavigation = [
    { name: 'Home', href: '/' },
    { name: 'Marketplace', href: '/marketplace' }
  ];

  footerNavigation = [
    { name: 'Contact', href: '/help-center' },
    { name: 'About', href: '/about' }
  ];

  navigation: any[] = [];

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.auth.user$.subscribe(user => {
      this.user = user;
      this.buildNavigation();
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentPath = event.urlAfterRedirects;
        this.isMenuOpen = false;
        this.isProfileOpen = false;
      }
    });
  }

  /* ---------- BUILD NAV ORDER ---------- */
  buildNavigation(): void {
    const dashboard = this.getDashboardLink();

    this.navigation = [
      ...this.baseNavigation,
      ...(dashboard ? [dashboard] : []),
      ...this.footerNavigation
    ];
  }

  getDashboardLink() {
    if (!this.user) return null;

    switch (this.user.role) {
      case 'ADMIN':
        return { name: 'Dashboard', href: '/admin/dashboard' };
      case 'FARMER':
        return { name: 'Dashboard', href: '/farmer' };
      case 'BUYER':
        return { name: 'Dashboard', href: '/consumer' };
      case 'DISTRIBUTOR':
        return { name: 'Dashboard', href: '/distributor' };
      default:
        return null;
    }
  }

  /* ---------- PROFILE ---------- */
  toggleProfile(): void {
    this.isProfileOpen = !this.isProfileOpen;
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-menu')) {
      this.isProfileOpen = false;
    }
  }
goToProfile(): void {
  this.router.navigate(['/profile']);
  this.isProfileOpen = false;
}



  getUserInitials(): string {
    if (!this.user?.name) return 'U';
    const parts = this.user.name.split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }

  goToKisanAI(): void {
    this.router.navigate(['/farmer/ai-assistant']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
