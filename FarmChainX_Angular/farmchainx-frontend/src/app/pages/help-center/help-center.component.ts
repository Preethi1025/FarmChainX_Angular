import {
  Component,
  ElementRef,
  ViewChild,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  tags: string[];
}

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.css']
})
export class HelpCenterComponent implements OnInit {

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchQuery = '';
  activeCategory = 'all';
  expandedFaqs: Record<string, boolean> = {};
  showContactForm = false;
  contactTopic = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && this.router.url.includes('#')) {
        const id = this.router.url.split('#')[1];
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
          this.expandedFaqs[id] = true;
        });
      }
    });
  }

  /* ---------------- DATA ---------------- */

  helpCategories = [
    { id: 'getting-started', title: 'Getting Started', bgColor: 'bg-blue-50', description: 'Account setup & basics' },
    { id: 'marketplace', title: 'Marketplace', bgColor: 'bg-green-50', description: 'Buying & selling crops' },
    { id: 'traceability', title: 'Traceability', bgColor: 'bg-purple-50', description: 'Track farm to table' },
    { id: 'payments', title: 'Payments', bgColor: 'bg-yellow-50', description: 'Billing & payouts' }
  ];

  faqs: Record<string, FAQ[]> = {
    'getting-started': [
      {
        id: 'gs-1',
        question: 'How do I create an account?',
        answer: 'Click Sign Up → Choose role → Verify email → Complete profile.',
        tags: ['account', 'signup']
      }
    ],
    'marketplace': [
      {
        id: 'mp-1',
        question: 'How do I list products?',
        answer: 'Go to dashboard → Add product → Publish.',
        tags: ['listing', 'sell']
      }
    ]
  };

  /* ---------------- HELPERS (FIXES TEMPLATE ERRORS) ---------------- */

  get hasResults(): boolean {
    return Object.keys(this.filteredFaqs).length > 0;
  }

  getCategoryTitle(key: string): string {
    return key.replace(/-/g, ' ');
  }

  getFirstFaqId(): string | null {
    const categories = Object.keys(this.filteredFaqs);
    if (!categories.length) return null;
    return this.filteredFaqs[categories[0]][0]?.id ?? null;
  }

  /* ---------------- FILTERED DATA ---------------- */

  get filteredFaqs(): Record<string, FAQ[]> {
    const result: Record<string, FAQ[]> = {};

    Object.keys(this.faqs).forEach(category => {
      if (this.activeCategory !== 'all' && this.activeCategory !== category) return;

      const filtered = this.faqs[category].filter(faq =>
        !this.searchQuery ||
        faq.question.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        faq.tags.some(t => t.includes(this.searchQuery.toLowerCase()))
      );

      if (filtered.length) result[category] = filtered;
    });

    return result;
  }

  /* ---------------- ACTIONS ---------------- */

  handleSearch(e: Event): void {
    e.preventDefault();
    const firstId = this.getFirstFaqId();
    if (firstId) {
      this.router.navigate([], { fragment: firstId });
    }
  }

  toggleFaq(id: string): void {
    this.expandedFaqs[id] = !this.expandedFaqs[id];
  }

  handleContactClick(topic: string): void {
    this.contactTopic = topic;
    this.showContactForm = true;
  }

  closeContact(): void {
    this.showContactForm = false;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.activeCategory = 'all';
    this.searchInput?.nativeElement.focus();
  }
}
