import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Import CommonModule

export interface Batch {
  batchId: string;
  cropType?: string;
  cropImageUrl?: string;
  status?: string;
  totalQuantity?: number;
  price?: number;
  listingQuantity?: number;
  farmerName?: string;
  farmerId?: string;
  location?: string;
  avgQualityScore?: number;
  certification?: string;
}

@Component({
  selector: 'app-batch-card',
  standalone: true, // important if using standalone component
  imports: [CommonModule], // ✅ Add CommonModule here
  templateUrl: './batch-card.component.html',
})
export class BatchCardComponent {
  @Input() batch!: Batch;
  @Input() readOnly: boolean = false;

  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();
  @Output() trace = new EventEmitter<string>();

  get imageUrl(): string {
    return this.batch?.cropImageUrl
      ? `http://localhost:8080${encodeURI(this.batch.cropImageUrl)}`
      : '/assets/placeholder.png';
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = '/assets/placeholder.png';
  }

  emitApprove() {
    this.approve.emit(this.batch.batchId);
  }

  emitReject() {
    this.reject.emit(this.batch.batchId);
  }

  emitTrace() {
    this.trace.emit(this.batch.batchId);
  }
}
