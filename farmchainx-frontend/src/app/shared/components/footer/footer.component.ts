import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ContactFormComponent } from '../contact-form/contact-form.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ContactFormComponent
  ],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {

  /* =======================
     INPUTS
  ======================= */
  @Input() userType?: string;
  @Input() userId?: number;
  @Input() userName?: string;

  /* =======================
     STATE
  ======================= */
  showContactForm = false;
  year = new Date().getFullYear();

  constructor(private router: Router) {}

  /* =======================
     FOOTER NAV HANDLER
  ======================= */
  handleFooterClick(item: string): void {
    switch (item) {

      /* ---------- PLATFORM ---------- */
      case 'marketplace':
        this.router.navigate(['/marketplace']);
        break;

      case 'trace':
        // Traceability requires batchId normally.
        // Redirecting to marketplace for QR / search based entry.
        this.router.navigate(['/marketplace']);
        break;

      case 'farmer-dashboard':
        this.router.navigate(['/farmer']);
        break;

      case 'buyer-dashboard':
        this.router.navigate(['/consumer']);
        break;

      /* ---------- SUPPORT ---------- */
      case 'help':
        this.router.navigate(['/help-center']);
        break;

      case 'contact':
        this.showContactForm = true;
        break;

      case 'privacy':
        this.router.navigate(['/privacy-policy']);
        break;

      case 'terms':
        this.router.navigate(['/terms-conditions']);
        break;

      default:
        console.warn('Unknown footer link:', item);
    }
  }

  /* =======================
     CLOSE CONTACT MODAL
  ======================= */
  closeContact(): void {
    this.showContactForm = false;
  }
}
