import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

const API = 'http://localhost:8080';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, HttpClientModule, DecimalPipe],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">
      <h1 class="text-3xl font-bold mb-8">My Orders 📦</h1>

      <div *ngIf="loading" class="text-center text-gray-600">Loading your orders...</div>
      <div *ngIf="!loading && orders.length === 0" class="text-gray-500">
        No orders placed yet.
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div *ngFor="let order of orders"
             class="bg-white p-6 rounded-2xl shadow border-l-4"
             [ngClass]="order?.status === 'CANCELLED' ? 'border-red-500' : 'border-green-500'">

          <!-- IMAGE -->
          <div class="mb-4">
            <img *ngIf="order?.cropImageUrl; else noImage"
                 [src]="getImageUrl(order)"
                 alt="{{ order?.cropName }}"
                 class="w-full h-40 object-cover rounded-lg"
                 (error)="onImageError($event)" />
            <ng-template #noImage>
              <div class="w-full h-40 bg-gray-100 flex items-center justify-center rounded-lg text-gray-400 text-sm">
                No Image Available
              </div>
            </ng-template>
          </div>

          <!-- HEADER -->
          <div class="flex justify-between items-center mb-3">
            <h2 class="font-semibold">{{ order?.orderCode }}</h2>
            <span class="px-3 py-1 text-sm rounded-full font-medium"
                  [ngClass]="order?.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
              {{ statusLabels[order?.status] }}
            </span>
          </div>

          <!-- DETAILS -->
          <div class="text-sm text-gray-600 space-y-1 mb-3">
            <p><b>Crop:</b> {{ order?.cropName }} ({{ order?.cropType }})</p>
            <p><b>Farmer:</b> {{ order?.farmerName }} {{ order?.farmerPhone ? '(' + order?.farmerPhone + ')' : '' }}</p>
            <p><b>Distributor:</b> {{ order?.distributorName }} {{ order?.distributorPhone ? '(' + order?.distributorPhone + ')' : '' }}</p>
          </div>

          <!-- META -->
          <div class="text-sm text-gray-600 space-y-1">
            <div>📦 Quantity: {{ order?.quantity }} kg</div>
            <div>💰 Total: ₹{{ order?.totalAmount | number:'1.2-2' }}</div>
            <div>📅 Ordered on: {{ order?.createdAt | date:'short' }}</div>
          </div>

          <!-- ACTIONS -->
          <div class="mt-4 flex gap-3">
            <button
              (click)="trackingOrder = order"
              [disabled]="order?.status === 'CANCELLED'"
              class="flex-1 px-4 py-2 rounded-lg font-semibold text-white"
              [ngClass]="order?.status === 'CANCELLED' ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'">
              Track Order
            </button>

            <button *ngIf="order?.status !== 'DELIVERED' && order?.status !== 'CANCELLED'"
                    (click)="cancelOrder(order.orderId)"
                    class="flex-1 px-4 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white">
              ❌ Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- TRACKING MODAL -->
      <div *ngIf="trackingOrder" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
        <div class="bg-white rounded-2xl w-full max-w-lg p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">📦 Tracking – {{ trackingOrder?.orderCode }}</h2>
            <button (click)="trackingOrder = null">X</button>
          </div>

          <div class="space-y-3">
            <div *ngFor="let item of trackingSteps(trackingOrder)" class="flex gap-3">
              <div>➡️</div>
              <div>
                <p class="font-semibold">{{ item.title }}</p>
                <p class="text-sm text-gray-500">{{ item.time ? (item.time | date:'short') : 'Pending' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class MyOrdersComponent implements OnInit {
  user: any;
  orders: any[] = [];
  loading = true;
  trackingOrder: any = null;

  statusLabels: any = {
    ORDER_PLACED: 'Order Placed',
    IN_WAREHOUSE: 'In Warehouse',
    IN_TRANSIT: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled ❌'
  };

  constructor(private auth: AuthService, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.user = this.auth.user;
    this.fetchOrders();
  }

  fetchOrders() {
    if (!this.user?.id) return;
    this.loading = true;
    this.http.get<any[]>(`${API}/api/orders/consumer/${this.user.id}/full`).subscribe({
      next: res => { this.orders = res || []; this.loading = false; this.cdr.detectChanges(); },
      error: err => { console.error('Error fetching orders', err); this.loading = false; this.cdr.detectChanges(); }
    });
  }

  cancelOrder(orderId: number) {
    const reason = prompt('Please enter a reason for cancellation');
    if (!reason) return;

    this.http.put(`${API}/api/orders/${orderId}/cancel`, { cancelReason: reason })
      .subscribe(() => this.fetchOrders());
  }

  trackingSteps(order: any) {
    return [
      { title: 'Order Placed', time: order?.createdAt },
      { title: 'In Warehouse', time: order?.warehouseAt },
      { title: 'Out for Delivery', time: order?.inTransitAt },
      { title: 'Delivered', time: order?.deliveredAt },
    ];
  }

  getImageUrl(order: any): string {
    return order?.cropImageUrl?.startsWith('/uploads')
      ? `${API}${order.cropImageUrl}`
      : order?.imageName
      ? `${API}/uploads/${order.imageName}`
      : '/assets/placeholder.png';
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = '/assets/placeholder.png';
  }
}
