import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">

      <!-- LEFT PROFILE CARD -->
      <div class="left-card">
        <div class="avatar">{{ getInitials() }}</div>
        <h2>{{ user?.name }}</h2>
        <p class="username">{{ user?.role }}</p>

        <button class="edit-btn" (click)="toggleEdit()">
          ✏ Edit Profile
        </button>

        <div class="stats">
          <div>
            <span>Email</span>
            <p>{{ user?.email }}</p>
          </div>
          <div>
            <span>Phone</span>
            <p>{{ user?.phone }}</p>
          </div>
        </div>
      </div>

      <!-- RIGHT INFO -->
      <div class="right-card">

        <!-- VIEW MODE -->
        <div *ngIf="!editMode" class="info-grid">
          <div class="info-card">
            <span>User ID</span>
            <p>{{ user?.id }}</p>
          </div>

          <div class="info-card">
            <span>Role</span>
            <p>{{ user?.role }}</p>
          </div>

          <div class="info-card wide">
            <span>Email</span>
            <p>{{ user?.email }}</p>
          </div>

          <div class="info-card wide">
            <span>Phone</span>
            <p>{{ user?.phone }}</p>
          </div>
        </div>

        <!-- EDIT MODE -->
        <div *ngIf="editMode" class="edit-grid">
          <div>
            <label>Name</label>
            <input [(ngModel)]="editableUser.name" name="name">
          </div>

          <div>
            <label>Email</label>
            <input [(ngModel)]="editableUser.email" name="email">
          </div>

          <div>
            <label>Phone</label>
            <input [(ngModel)]="editableUser.phone" name="phone">
          </div>

          <div class="actions">
            <button class="save" (click)="save()">Save</button>
            <button class="cancel" (click)="cancel()">Cancel</button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 3rem auto;
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 2rem;
    }

    /* LEFT CARD */
    .left-card {
      background: #fff;
      border-radius: 1rem;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 6px 20px rgba(0,0,0,0.06);
    }

    .avatar {
      width: 90px;
      height: 90px;
      margin: 0 auto;
      border-radius: 50%;
      background: #f97316;
      color: white;
      font-size: 2rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    h2 {
      margin-top: 1rem;
      font-size: 1.4rem;
      font-weight: 700;
    }

    .username {
      font-size: 0.85rem;
      color: #6b7280;
      letter-spacing: 0.12em;
      margin-top: 0.2rem;
    }

    .edit-btn {
      margin-top: 1.2rem;
      background: #ecfdf5;
      color: #16a34a;
      padding: 0.5rem 1.2rem;
      border-radius: 0.5rem;
      font-weight: 600;
    }

    .stats {
      margin-top: 2rem;
      text-align: left;
    }

    .stats div {
      margin-bottom: 1rem;
    }

    .stats span {
      font-size: 0.7rem;
      color: #6b7280;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .stats p {
      font-weight: 600;
      margin-top: 0.2rem;
    }

    /* RIGHT CARD */
    .right-card {
      background: #fff;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 6px 20px rgba(0,0,0,0.06);
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .info-card {
      background: #f9fafb;
      border-radius: 0.8rem;
      padding: 1.2rem;
    }

    .info-card span {
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #6b7280;
    }

    .info-card p {
      margin-top: 0.4rem;
      font-size: 1rem;
      font-weight: 600;
    }

    .wide {
      grid-column: span 2;
    }

    /* EDIT MODE */
    .edit-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    label {
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
    }

    input {
      width: 100%;
      margin-top: 0.4rem;
      padding: 0.6rem;
      border-radius: 0.5rem;
      border: 1px solid #d1d5db;
    }

    .actions {
      grid-column: span 2;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }

    .save {
      background: #16a34a;
      color: white;
      padding: 0.5rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
    }

    .cancel {
      border: 1px solid #d1d5db;
      padding: 0.5rem 1.5rem;
      border-radius: 0.5rem;
    }
  `]
})
export class ProfileComponent implements OnInit {

  user: any;
  editableUser: any = {};
  editMode = false;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.auth.user;
    this.editableUser = { ...this.user };
  }

  toggleEdit() {
    this.editMode = !this.editMode;
  }

  save() {
    this.auth.setUser(this.editableUser);
    this.user = { ...this.editableUser };
    this.editMode = false;
  }

  cancel() {
    this.editableUser = { ...this.user };
    this.editMode = false;
  }

  getInitials(): string {
    if (!this.user?.name) return 'U';
    const n = this.user.name.split(' ');
    return n.length > 1 ? (n[0][0] + n[1][0]).toUpperCase() : n[0][0].toUpperCase();
  }
}
