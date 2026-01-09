import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ListingModalComponent } from '../components/listing-modal/listing-modal.component';
import { AddCropModalComponent } from '../components/add-crop-modal/add-crop-modal.component';
import { BatchManagementComponent } from '../components/batch-management/batch-management.component';
import { TracePreviewComponent } from '../components/trace-preview/trace-preview.component';

@Component({
  selector: 'app-farmer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListingModalComponent,
    AddCropModalComponent,
    BatchManagementComponent,
    TracePreviewComponent
  ],
  templateUrl: './farmer-dashboard.component.html'
})
export class FarmerDashboardComponent implements OnInit {

  crops: any[] = [];
  orders: any[] = [];
  loading = true;

  // ✅ REVENUE
  totalRevenue = 0;

  // modals
  showListingModal = false;
  showAddCropModal = false;
  showBatchManagement = false;

  // TRACE MODAL
  showTrace = false;
  activeBatchId: string | null = null;
  traceRenderKey = 0;

  selectedCrop: any = null;

  constructor(
    public auth: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.fetchCrops();
    this.fetchFarmerRevenue(); // ✅ ADDED
  }

  /* ---------------- FETCH CROPS ---------------- */

  fetchCrops(): void {
    const user = this.auth.user;

    if (!user?.id) {
      this.loading = false;
      return;
    }

    forkJoin({
      crops: this.http.get<any[]>(
        `http://localhost:8080/api/crops/farmer/${user.id}`
      ),
      listings: this.http.get<any[]>(
        `http://localhost:8080/api/listings/`
      )
    }).subscribe({
      next: ({ crops, listings }) => {
        const listedIds = new Set(
          (listings ?? []).map(l => l.cropId)
        );

        this.crops = (crops ?? []).map(crop => ({
          ...crop,
          listed: listedIds.has(crop.cropId)
        }));
      },
      error: err => {
        console.error('Failed to load crops', err);
        this.crops = [];
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  /* ---------------- FETCH REVENUE ---------------- */

  fetchFarmerRevenue(): void {
    const farmerId = this.auth.user?.id;
    if (!farmerId) return;

    this.http
      .get<any[]>(`http://localhost:8080/api/orders/farmer/${farmerId}`)
      .subscribe({
        next: (orders) => {
          this.orders = orders ?? [];

          const deliveredOrders = this.orders.filter(
            o => o.status === 'DELIVERED'
          );

          this.totalRevenue = deliveredOrders.reduce(
            (sum, order) => sum + (order.totalAmount || 0),
            0
          );
        },
        error: (err) => {
          console.error('Failed to fetch revenue', err);
          this.totalRevenue = 0;
        }
      });
  }

  /* ---------------- COMPUTED ---------------- */

  get totalProducts(): number {
    return this.crops.length;
  }

  get activeListingsCount(): number {
    return this.crops.filter(c => c.listed).length;
  }

  /* ---------------- ACTIONS ---------------- */

  openListing(crop: any): void {
    this.selectedCrop = {
      ...crop,
      farmerId: this.auth.user?.id
    };
    this.showListingModal = true;
  }

  onListingSuccess(data: { cropId: number }): void {
    this.crops = this.crops.map(c =>
      c.cropId === data.cropId ? { ...c, listed: true } : c
    );
  }

  onCropAdded(): void {
    this.showAddCropModal = false;
    this.fetchCrops();
  }

  /* ---------------- TRACE ---------------- */

 openTrace(batchId?: string) {
  if (!batchId) return;

  const traceUrl = `http://localhost:4200/trace/${batchId}`;
  window.open(traceUrl, '_blank');
}


  /* ---------------- HELPERS ---------------- */

  trackByCropId(_: number, crop: any) {
    return crop.cropId;
  }

  getImageUrl(crop: any): string {
    if (!crop?.cropImageUrl) {
      return 'assets/placeholder-crop.jpg';
    }
    if (crop.cropImageUrl.startsWith('http')) {
      return crop.cropImageUrl;
    }
    return `http://localhost:8080${crop.cropImageUrl}`;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/placeholder-crop.jpg';
  }
}
