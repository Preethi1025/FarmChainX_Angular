// src/app/shared/components/contact-form/contact-form.component.ts
import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SupportService } from '../../../core/services/support.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.css']
})
export class ContactFormComponent implements OnInit {

  /* ================= INPUTS FROM FOOTER ================= */
  @Input() userType?: string;
  @Input() userId?: number;
  @Input() userName?: string;

  /* ================= OUTPUT ================= */
  @Output() close = new EventEmitter<void>();

  user: any = null;
  loading = false;

  message = {
    text: '',
    type: '' as 'success' | 'error' | 'warning' | ''
  };

  formData = {
    issueType: '',
    reportedAgainstId: '',
    reportedAgainstType: '',
    subject: '',
    description: ''
  };

  issueTypes = [
    { value: 'TECHNICAL', label: 'Technical Issue' },
    { value: 'USER_DISPUTE', label: 'Issue with Another User' },
    { value: 'PAYMENT', label: 'Payment Problem' },
    { value: 'PRODUCT_QUALITY', label: 'Product Quality Issue' },
    { value: 'DELIVERY', label: 'Delivery Issue' },
    { value: 'ACCOUNT', label: 'Account Issue' },
    { value: 'OTHER', label: 'Other' }
  ];

  userTypes = [
    { value: 'FARMER', label: 'Farmer' },
    { value: 'DISTRIBUTOR', label: 'Distributor' },
    { value: 'BUYER', label: 'Buyer' },
    { value: 'ADMIN', label: 'Admin' }
  ];

  constructor(
    private auth: AuthService,
    private supportService: SupportService
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(user => {
      this.user = user;

      if (!user) {
        this.message = {
          text: 'Please login to create a support ticket.',
          type: 'error'
        };
        return;
      }

      /* ===== FALLBACKS IF FOOTER DID NOT PASS VALUES ===== */
      if (!this.userId) this.userId = user.id;
      if (!this.userType) this.userType = user.role;
      if (!this.userName) this.userName = user.name || user.email || 'User';
    });
  }

  /* ================= SUBMIT ================= */
handleSubmit(): void {
  // -------- VALIDATION --------
  if (!this.user || !this.userId || !this.userType) {
    this.message = {
      text: 'User information is not available. Please login again.',
      type: 'error'
    };
    return;
  }

  if (!this.formData.issueType || !this.formData.subject || !this.formData.description) {
    this.message = {
      text: 'Please fill all required fields.',
      type: 'error'
    };
    return;
  }

  // -------- SHOW SUCCESS MESSAGE IMMEDIATELY --------
  this.message = {
    text: '🎉 Ticket submitted successfully! Admin will review it within 24 hours.',
    type: 'success'
  };

  this.loading = true;

  const ticketData = {
    reportedById: this.userId,
    reportedByRole: this.userType.toUpperCase(),
    reportedAgainstId: this.formData.reportedAgainstId || null,
    reportedAgainstType: this.formData.reportedAgainstType || null,
    issueType: this.formData.issueType,
    subject: this.formData.subject,
    description: this.formData.description,
    priority: this.formData.issueType === 'PAYMENT' ? 'HIGH' : 'MEDIUM',
    status: 'OPEN'
  };

  // -------- FIRE & FORGET API CALL --------
  this.supportService.createTicket(ticketData).subscribe({
    next: () => {
      // nothing needed here
    },
    error: () => {
      // optional: log error silently
      console.error('Ticket creation failed in backend');
    },
    complete: () => {
      this.loading = false;
    }
  });

  // -------- RESET FORM --------
  this.formData = {
    issueType: '',
    reportedAgainstId: '',
    reportedAgainstType: '',
    subject: '',
    description: ''
  };

  // -------- AUTO CLOSE AFTER 6 SECONDS --------
  setTimeout(() => {
    this.close.emit();
  }, 6000);
}



  onClose(): void {
    this.close.emit();
  }
}