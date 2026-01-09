import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BatchCardComponent } from '../batch-card/batch-card.component';

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [CommonModule, BatchCardComponent],
  templateUrl: './parent-component.component.html'
})
export class ParentComponent {

  @Input() batches: any[] = [];

  constructor(private router: Router) {}

  handleTrace(batchId: string) {
    this.router.navigate(['/trace', batchId]);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = '/placeholder.png';
  }
  onApprove(id: string) {
  console.log('Approve', id);
}

onReject(id: string) {
  console.log('Reject', id);
}

}
