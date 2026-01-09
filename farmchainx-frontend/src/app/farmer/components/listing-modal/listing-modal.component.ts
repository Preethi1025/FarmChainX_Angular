import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-listing-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listing-modal.component.html'
})
export class ListingModalComponent {

  @Input() crop: any;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<{ cropId: number }>();

  price: number | null = null;
  quantity: number | null = null;
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Initialize from crop (same as React useState)
    this.price = this.crop?.price ?? null;
    this.quantity = this.crop?.quantity ?? null;
  }

  submit() {
    if (!this.price || !this.quantity) {
      alert('Price and Quantity are required!');
      return;
    }

    const payload = {
      cropId: this.crop.cropId,
      farmerId: this.crop.farmerId,
      batchId: this.crop.batchId,
      price: Number(this.price),
      quantity: Number(this.quantity),
      status: 'PENDING' // ✅ same as React
    };

    this.loading = true;

    this.http.post(
      'http://localhost:8080/api/listings/create',
      payload
    ).subscribe({
      next: () => {
        alert('Listing submitted for distributor approval!');
        this.success.emit({ cropId: this.crop.cropId });
        this.close.emit();
      },
      error: (err) => {
        console.error('Error Creating Listing:', err);
        alert('Failed to create listing.');
      },
      complete: () => this.loading = false
    });
  }

  closeModal() {
    this.close.emit();
  }

  stop(e: Event) {
    e.stopPropagation();
  }
}
