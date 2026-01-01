// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private API = 'http://localhost:8080/api/support';

  constructor(private http: HttpClient) {}

  getUserNotifications(
    userId: string,
    role: string
  ): Observable<any> {
    return this.http.get(
      `${this.API}/notifications/${userId}/${role}`
    );
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(
      `${this.API}/notifications/${notificationId}/read`,
      {}
    );
  }

  markAllAsRead(userId: string, role: string): Observable<any> {
    return this.http.put(
      `${this.API}/notifications/read-all/${userId}/${role}`,
      {}
    );
  }

  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(
      `${this.API}/notifications/${notificationId}`
    );
  }
}
