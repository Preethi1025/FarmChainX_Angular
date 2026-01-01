// src/app/core/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getAdminStats() {
  return this.http.get('http://localhost:8080/api/admin/stats');
}


  // Users
  getFarmers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/farmers`);
  }

  getDistributors(): Observable<any> {
    return this.http.get(`${this.baseUrl}/distributors`);
  }

  getConsumers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/consumers`);
  }

  getAdmins(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admins`);
  }

  // User actions
  blockUser(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/block/${id}`, {});
  }

  unblockUser(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/unblock/${id}`, {});
  }

  updateUserRole(id: string, role: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/role/${id}`, { role: role });
  }

  // Crops
  getCrops(): Observable<any> {
    return this.http.get(`${this.baseUrl}/crops`);
  }

  deleteCrop(id: string): Observable<any> {
    return this.http.delete(`http://localhost:8080/api/crops/delete/${id}`);
  }
}