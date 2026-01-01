// src/app/admin/crops/admin-crops.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-crops',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-crops.component.html'
})
export class AdminCropsComponent implements OnInit {

  crops: any[] = [];
  loading = true;

  /* FILTER STATE */
  search = '';
  statusFilter: 'ALL' | 'PLANTED' | 'HARVESTED' | 'SOLD' = 'ALL';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCrops();
  }

  loadCrops(): void {
    this.loading = true;

    this.http.get<any[]>('http://localhost:8080/api/admin/crops')
      .subscribe({
        next: (res) => {
          this.crops = res || [];
        },
        error: (err) => {
          console.error('Failed to load crops', err);
          this.crops = [];
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  /* ---------- FILTERED CROPS ---------- */
  get filteredCrops(): any[] {
    return this.crops
      .filter(c =>
        !this.search ||
        JSON.stringify(c)
          .toLowerCase()
          .includes(this.search.toLowerCase())
      )
      .filter(c =>
        this.statusFilter === 'ALL' ||
        c.status === this.statusFilter
      );
  }

  deleteCrop(id: number): void {
    if (!confirm('Are you sure you want to delete this crop?')) return;

    this.http
      .delete(`http://localhost:8080/api/crops/delete/${id}`)
      .subscribe(() => this.loadCrops());
  }
}
