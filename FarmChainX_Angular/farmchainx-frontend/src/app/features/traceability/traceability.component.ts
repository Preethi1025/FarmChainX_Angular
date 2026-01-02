import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Required for *ngIf / *ngFor

interface TraceStep {
  status: string;
  timestamp: string;
  changedBy?: string;
  location?: string;
  remarks?: string;
}

@Component({
  selector: 'app-traceability',
  standalone: true, // standalone component
  imports: [CommonModule],
  templateUrl: './traceability.component.html',
  styleUrls: ['./traceability.component.css']
})
export class TraceabilityComponent implements OnInit {
  batchId: string | null = null;
  trace: TraceStep[] = [];
  farmerId: string | null = null;
  cropName: string | null = null;
  distributorId: string | null = null;
  loading = true;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.batchId = this.route.snapshot.paramMap.get('batchId');
    if (this.batchId) this.fetchTrace(this.batchId);
  }

  fetchTrace(batchId: string) {
    this.loading = true;

    // Use relative path; Vite proxy will forward to backend
   this.http.get<any>(`http://localhost:8080/api/batches/${batchId}/trace`)

.subscribe({
      next: (res) => {
        this.farmerId = res.farmerId;
        this.cropName = res.cropType || 'Not Available';
        this.distributorId = res.distributorId || 'Not Assigned';
        this.trace = res.traces || [];
      },
      error: (err) => {
        console.error('Error fetching trace:', err);
        alert('Failed to fetch trace data. Check backend connection.');
      },
      complete: () => (this.loading = false)
    });
  }

  formatDateTime(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(',', ' ·');
  }

  getStatusBullet(status: string) {
    switch (status.toLowerCase()) {
      case 'planted': return { classes: 'bg-green-100 text-green-700', emoji: '🌱' };
      case 'growing': return { classes: 'bg-blue-100 text-blue-700', emoji: '⏳' };
      case 'ready_for_harvest': return { classes: 'bg-yellow-100 text-yellow-700', emoji: '📦' };
      case 'harvested': return { classes: 'bg-green-200 text-green-800', emoji: '✅' };
      case 'listed': return { classes: 'bg-purple-100 text-purple-700', emoji: '⏳' };
      case 'sold': return { classes: 'bg-gray-200 text-gray-700', emoji: '✅' };
      default: return { classes: 'bg-gray-100 text-gray-500', emoji: '⏳' };
    }
  }
}
