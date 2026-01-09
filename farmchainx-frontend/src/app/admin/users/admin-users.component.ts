// src/app/admin/users/admin-users.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent implements OnInit {

  users: any[] = [];
  loading = true;

  /* FILTER STATE */
  search = '';
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';
  roleFilter: 'ALL' | 'FARMER' | 'DISTRIBUTOR' | 'BUYER' | 'ADMIN' = 'ALL';

  /* ROLE CHANGE */
  pendingRoleChange: { user: any; role: string } | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.loading = true;

    try {
      const [farmers, distributors, consumers, admins] =
        await Promise.all([
          this.http.get<any[]>('http://localhost:8080/api/admin/farmers').toPromise(),
          this.http.get<any[]>('http://localhost:8080/api/admin/distributors').toPromise(),
          this.http.get<any[]>('http://localhost:8080/api/admin/consumers').toPromise(),
          this.http.get<any[]>('http://localhost:8080/api/admin/admins').toPromise()
        ]);

      this.users = [
        ...(farmers || []),
        ...(distributors || []),
        ...(consumers || []),
        ...(admins || [])
      ];

    } catch (err) {
      console.error('Failed to load users', err);
      this.users = [];
    } finally {
      this.loading = false;
    }
  }

  /* -------- FILTERED USERS -------- */
  get filteredUsers(): any[] {
    return this.users
      .filter(u =>
        JSON.stringify(u).toLowerCase().includes(this.search.toLowerCase())
      )
      .filter(u =>
        this.statusFilter === 'ALL' ||
        (this.statusFilter === 'ACTIVE' && !u.blocked) ||
        (this.statusFilter === 'INACTIVE' && u.blocked)
      )
      .filter(u =>
        this.roleFilter === 'ALL' || u.role === this.roleFilter
      );
  }

  /* -------- ACTIONS -------- */
  blockUser(id: string): void {
    this.http.put(`http://localhost:8080/api/admin/block/${id}`, {})
      .subscribe(() => this.loadUsers());
  }

  unblockUser(id: string): void {
    this.http.put(`http://localhost:8080/api/admin/unblock/${id}`, {})
      .subscribe(() => this.loadUsers());
  }

  confirmRoleChange(): void {
    if (!this.pendingRoleChange) return;

    const { user, role } = this.pendingRoleChange;

    this.http.put(
      `http://localhost:8080/api/admin/role/${user.id}`,
      { role }
    ).subscribe(() => {
      this.pendingRoleChange = null;
      this.loadUsers();
    });
  }
}
