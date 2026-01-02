import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TracePreviewComponent } from '../trace-preview/trace-preview.component';

@Component({
  selector: 'app-batch-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './batch-management.component.html'
})
export class BatchManagementComponent implements OnInit {

  @Input() user!: any;
  @Output() close = new EventEmitter<void>();

  apiBase = 'http://localhost:8080/api/batches';

  STATUS_OPTIONS = [
    'PLANTED',
    'GROWING',
    'READY_FOR_HARVEST',
    'HARVESTED',
    'LISTED',
    'SOLD'
  ];

  QUALITY_OPTIONS = ['A', 'B', 'C'];

  batches: any[] = [];
  batchCrops: Record<string, any[]> = {};

  expandedBatchId: string | null = null;

  // 🔥 SEPARATE LOADERS
  loadingCrops: Record<string, boolean> = {};
  loadingAction: Record<string, boolean> = {};
  processingHarvest = false;

  error = '';

  // 🔥 UI STATE (INITIALIZED PER BATCH)
  statusUpdate: Record<string, string> = {};
  qualityUpdate: Record<string, { grade: string; confidence: number | null }> = {};
  mergeTarget: Record<string, string> = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchBatches();
  }

  /* ---------------- FETCH ---------------- */

  fetchBatches(): void {
    if (!this.user?.id) return;

    this.error = '';

    const url =
      this.user.role === 'FARMER'
        ? `${this.apiBase}/farmer/${this.user.id}`
        : `${this.apiBase}/pending`;

    this.http.get<any[]>(url).subscribe({
      next: res => {
        this.batches = res || [];

        // 🔥 preload UI state
        this.batches.forEach(b => {
          this.statusUpdate[b.batchId] = b.status;

          if (!this.qualityUpdate[b.batchId]) {
            this.qualityUpdate[b.batchId] = {
              grade: '',
              confidence: null
            };
          }
        });
      },
      error: () => this.error = 'Failed to load batches.'
    });
  }

  fetchCropsForBatch(batchId: string): void {
    this.loadingCrops[batchId] = true;

    this.http.get<any[]>(`${this.apiBase}/${batchId}/crops`).subscribe({
      next: res => this.batchCrops[batchId] = res || [],
      error: () => this.error = 'Failed to load crops.',
      complete: () => this.loadingCrops[batchId] = false
    });
  }

  /* ---------------- UI ---------------- */

  toggleExpand(batchId: string): void {
    if (this.expandedBatchId === batchId) {
      this.expandedBatchId = null;
      return;
    }

    this.expandedBatchId = batchId;

    if (!this.batchCrops[batchId]) {
      this.fetchCropsForBatch(batchId);
    }

    // 🔥 ensure bindings always exist
    if (!this.qualityUpdate[batchId]) {
      this.qualityUpdate[batchId] = { grade: '', confidence: null };
    }

    if (!this.statusUpdate[batchId]) {
      const batch = this.batches.find(b => b.batchId === batchId);
      this.statusUpdate[batchId] = batch?.status || '';
    }
  }

  /* ---------------- STATUS ---------------- */

  applyStatusUpdate(batchId: string): void {
  const status = this.statusUpdate[batchId];
  if (!status) return alert('Select status');

  this.loadingAction[batchId] = true;

  this.http.put(`${this.apiBase}/${batchId}/status`, {
    status,
    userId: this.user.id
  }).subscribe({
    next: () => {
      // 🔥 Update batch status
      this.batches = this.batches.map(b =>
        b.batchId === batchId ? { ...b, status } : b
      );

      // 🔥 ALSO update crop statuses in UI
      if (this.batchCrops[batchId]) {
        this.batchCrops[batchId] = this.batchCrops[batchId].map(c => ({
          ...c,
          status
        }));
      }
    },
    error: () => alert('Status update failed'),
    complete: () => this.loadingAction[batchId] = false
  });
}


  /* ---------------- QUALITY ---------------- */

  applyQualityUpdate(batchId: string): void {
    const q = this.qualityUpdate[batchId];
    if (!q.grade) return alert('Select grade');

    this.loadingAction[batchId] = true;

    this.http.put(`${this.apiBase}/${batchId}/status`, {
      status: 'QUALITY_UPDATED',
      userId: this.user.id,
      qualityGrade: q.grade,
      confidence: q.confidence
    }).subscribe({
      next: () => {},
      error: () => alert('Quality update failed'),
      complete: () => this.loadingAction[batchId] = false
    });
  }

  /* ---------------- SPLIT / MERGE ---------------- */

  splitBatch(batchId: string): void {
    const qty = prompt('Enter quantity to split');
    if (!qty) return;

    this.loadingAction[batchId] = true;

    this.http.post(`${this.apiBase}/${batchId}/split`, {
      quantity: Number(qty),
      userId: this.user.id
    }).subscribe({
      next: () => this.fetchBatches(),
      error: () => alert('Split failed'),
      complete: () => this.loadingAction[batchId] = false
    });
  }

  mergeBatch(sourceId: string): void {
    const targetId = this.mergeTarget[sourceId];
    if (!targetId || targetId === sourceId) return;

    this.loadingAction[sourceId] = true;

    this.http.post(`${this.apiBase}/merge/${targetId}`, {
      sourceBatchIds: [sourceId],
      userId: this.user.id
    }).subscribe({
      next: () => this.fetchBatches(),
      error: () => alert('Merge failed'),
      complete: () => this.loadingAction[sourceId] = false
    });
  }

  /* ---------------- HARVEST ---------------- */

  processDailyHarvest(): void {
    if (!confirm('Process today’s harvest?')) return;

    this.processingHarvest = true;

    this.http.post(`${this.apiBase}/process-daily-harvest/${this.user.id}`, {})
      .subscribe({
        next: () => this.fetchBatches(),
        complete: () => this.processingHarvest = false
      });
  }

  getQrUrl(batch: any): string {
    return batch.qrCodeUrl || `${window.location.origin}/trace/${batch.batchId}`;
  }
}
