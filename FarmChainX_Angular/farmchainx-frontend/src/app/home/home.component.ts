import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
   imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class HomeComponent implements OnInit {

  features = [
    {
      icon: 'shield',
      title: 'Blockchain Traceability',
      description: 'Every product has an immutable journey record from farm to table',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: 'trending_up',
      title: 'AI-Powered Insights',
      description: 'Smart predictions for yield, pricing, and quality grading',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: 'users',
      title: 'Direct Marketplace',
      description: 'Connect directly with farmers, eliminate middlemen',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: 'scan',
      title: 'QR Verification',
      description: 'Scan to verify authenticity and complete product history',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  stats = [
    { number: '10K+', label: 'Farmers Connected' },
    { number: '50K+', label: 'Products Tracked' },
    { number: '99.9%', label: 'Traceability Accuracy' },
    { number: '40%', label: 'Farmer Income Increase' }
  ];

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Redirect logged-in users straight to dashboard
    if (this.auth.getUser()) {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    }
  }
}
