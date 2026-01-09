// src/app/shared/components/notification-bell/notification-bell.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

interface AppNotification {
  id: number;
  userId: string;
  userRole: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  notificationType: string;
}

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html'
})
export class NotificationBellComponent implements OnInit {

  notifications: AppNotification[] = [];
  unreadCount = 0;
  showDropdown = false;
  loading = false;

  user!: { id: string; role: string };

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((u: any) => {
      if (!u) return;
      this.user = { id: u.id, role: u.role };
      this.loadNotifications();
    });
  }

  loadNotifications(): void {
    this.loading = true;

    this.notificationService
      .getUserNotifications(this.user.id, this.user.role)
      .subscribe({
        next: (res: any) => {
          const list: AppNotification[] = res.notifications ?? [];

          // 🔒 HARD ROLE + USER ISOLATION
          this.notifications = list.filter(
            n =>
              n.userId === this.user.id &&
              n.userRole === this.user.role
          );

          this.unreadCount =
            this.notifications.filter(n => !n.read).length;

          this.loading = false;
        },
        error: () => {
          this.notifications = [];
          this.unreadCount = 0;
          this.loading = false;
        }
      });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  close(): void {
    this.showDropdown = false;
  }

  markAsRead(n: AppNotification, e: Event): void {
    e.stopPropagation();

    if (n.read) return;

    this.notificationService.markAsRead(n.id).subscribe(() => {
      n.read = true;
      this.unreadCount--;
    });
  }

  markAllAsRead(): void {
    this.notificationService
      .markAllAsRead(this.user.id, this.user.role)
      .subscribe(() => {
        this.notifications.forEach(n => (n.read = true));
        this.unreadCount = 0;
      });
  }

  delete(n: AppNotification, e: Event): void {
    e.stopPropagation();

    this.notificationService.deleteNotification(n.id).subscribe(() => {
      this.notifications =
        this.notifications.filter(x => x.id !== n.id);

      this.unreadCount =
        this.notifications.filter(x => !x.read).length;
    });
  }
}
