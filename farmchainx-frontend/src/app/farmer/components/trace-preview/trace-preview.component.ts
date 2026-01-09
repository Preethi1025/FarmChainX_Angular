import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-trace-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trace-preview.component.html'
})
export class TracePreviewComponent {

  traces: any[] = [];
  loading = false;

  private _batchId: string | null = null;

  @Input()
  set batchId(value: string | null) {
    if (value && value !== this._batchId) {
      this._batchId = value;
      this.loadTrace();
    }
  }

  get batchId(): string | null {
    return this._batchId;
  }

  constructor(private http: HttpClient) {}

  private loadTrace(): void {
    if (!this._batchId) return;

    this.loading = true;
    this.traces = [];

    this.http
      .get<any>(`http://localhost:8080/api/batches/${this._batchId}/trace`)
      .subscribe({
        next: res => {
          this.traces = res?.traces || [];
        },
        error: err => {
          console.error('Trace load failed', err);
          this.traces = [];
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
}
