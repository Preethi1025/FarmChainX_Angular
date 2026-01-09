import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./legal-docs.css']
})
export class PrivacyPolicyComponent {

  lastUpdated = 'December 1, 2023';

  dataCategories = [
    { name: 'Personal Information', examples: 'Name, email, phone, address' },
    { name: 'Business Information', examples: 'Business registration, tax ID, licenses' },
    { name: 'Financial Data', examples: 'Payment information, transaction history' },
    { name: 'Agricultural Data', examples: 'Crop information, farming practices, yield data' },
    { name: 'Traceability Data', examples: 'Product origin, handling, transportation details' },
    { name: 'Technical Data', examples: 'IP address, device information, usage patterns' }
  ];

  purposes = [
    'Provide and improve our Platform services',
    'Facilitate transactions between Producers and Purchasers',
    'Maintain accurate traceability records',
    'Ensure Platform security and prevent fraud',
    'Comply with legal obligations',
    'Communicate important updates and notifications',
    'Personalize user experience',
    'Conduct research and analytics'
  ];
}
