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
  loading = true;

  // modals
  showListingModal = false;
  showAddCropModal = false;
  showBatchManagement = false;

  // TRACE MODAL (🔥 SAME AS MARKETPLACE)
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

  /* ---------------- TRACE (🔥 SAME LOGIC) ---------------- */

  openTrace(batchId?: string) {
    if (!batchId) return;

    this.activeBatchId = batchId;
    this.showTrace = true;

    // 🔥 force second render
    setTimeout(() => {
      this.traceRenderKey++;
    });
  }

  closeTrace() {
    this.showTrace = false;
    this.activeBatchId = null;
  }

  reloadTrace() {
    this.traceRenderKey = this.traceRenderKey + 1;
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
