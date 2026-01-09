import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-page-loader',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `<app-loading-spinner></app-loading-spinner>`
})
export class PageLoaderComponent {}
