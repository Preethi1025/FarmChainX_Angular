import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.css']
})
export class QrScannerComponent implements OnDestroy {

  @Output() scan = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  isScanning = false;
  scannedData: any = null;
  stream: MediaStream | null = null;

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.isScanning = true;
    } catch {
      this.simulateScan();
    }
  }

  simulateScan() {
    const demo = {
      batchId: 'BCH_2024_001',
      product: 'Organic Tomatoes'
    };
    this.scannedData = demo;
    this.scan.emit(demo);
  }

  ngOnDestroy(): void {
    this.stream?.getTracks().forEach(t => t.stop());
  }
}
