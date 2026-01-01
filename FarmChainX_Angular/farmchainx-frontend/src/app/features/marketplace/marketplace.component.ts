import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TracePreviewComponent } from '../../farmer/components/trace-preview/trace-preview.component';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, TracePreviewComponent],
  templateUrl: './marketplace.component.html'
})
export class MarketplaceComponent implements OnInit {

  products: any[] = [];
  loading = true;

  // TRACE STATE
  showTrace = false;
  activeBatchId: string | null = null;

  // 🔥 KEY TO FORCE RE-CREATE
  traceRenderKey = 0;

  // filters
  search = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  /* ---------------- FETCH PRODUCTS ---------------- */

  fetchProducts(): void {
    this.loading = true;

    this.http.get<any[]>('http://localhost:8080/api/listings/')
      .subscribe({
        next: (res) => {
          this.products = (res || [])
            .filter(p => p.status === 'ACTIVE')
            .map(p => ({
              listingId: p.listingId,
              cropName: p.cropName,
              farmerId: p.farmerId,
              batchId: p.batchId || p.batch_id || p.batch?.batchId,
              price: Number(p.price),
              quantity: Number(p.quantity),
              qualityGrade: p.qualityGrade || 'Not Graded',
              cropImageUrl: p.cropImageUrl
            }));

          this.loading = false;
        },
        error: () => {
          this.products = [];
          this.loading = false;
        }
      });
  }

  /* ---------------- TRACE ---------------- */

  openTrace(batchId?: string) {
    if (!batchId) return;

    this.showTrace = true;
    this.activeBatchId = batchId;

    // 🔥 FORCE SECOND LOAD AFTER MODAL OPENS
    setTimeout(() => {
      this.traceRenderKey++;
    });
  }

  closeTrace() {
    this.showTrace = false;
    this.activeBatchId = null;
  }

  /* ---------------- BUY ---------------- */

  buyNow(product: any) {
    const role = localStorage.getItem('userRole');
    if (role !== 'BUYER') {
      alert('Please login as a buyer');
      return;
    }
    console.log('Buying product:', product);
  }

  /* ---------------- IMAGE ---------------- */

  getImageUrl(path: string | null): string {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    return `http://localhost:8080${path}`;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = '/placeholder.png';
  }

  /* ---------------- FILTER + SORT ---------------- */

  get filteredProducts(): any[] {
    return this.products
      .filter(p =>
        p.cropName.toLowerCase().includes(this.search.toLowerCase())
      )
      .filter(p => this.minPrice !== null ? p.price >= this.minPrice : true)
      .filter(p => this.maxPrice !== null ? p.price <= this.maxPrice : true)
      .sort((a, b) => {
        if (this.sortBy === 'PRICE_ASC') return a.price - b.price;
        if (this.sortBy === 'PRICE_DESC') return b.price - a.price;
        if (this.sortBy === 'QTY_ASC') return a.quantity - b.quantity;
        if (this.sortBy === 'QTY_DESC') return b.quantity - a.quantity;
        return 0;
      });
  }

  reloadTrace() {
  this.traceRenderKey = this.traceRenderKey + 1;
}

}
