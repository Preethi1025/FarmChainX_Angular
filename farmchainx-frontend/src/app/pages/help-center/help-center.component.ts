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

  /* ---------------- CATEGORIES ---------------- */

  helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Account & basics'
    },
    {
      id: 'farmer',
      title: 'Farmer Support',
      description: 'Selling crops & AI help'
    },
    {
      id: 'buyer',
      title: 'Buyer Support',
      description: 'Buying & tracking produce'
    },
    {
      id: 'admin',
      title: 'Admin Support',
      description: 'Platform management'
    }
  ];

  /* ---------------- FAQs ---------------- */

  faqs: Record<string, FAQ[]> = {

    'getting-started': [
      {
        id: 'gs-1',
        question: 'How do I create an account?',
        answer: 'Click Sign Up, choose your role, verify email, and complete your profile.',
        tags: ['signup', 'account']
      },
      {
        id: 'gs-2',
        question: 'Can I change my role later?',
        answer: 'No. Roles are fixed to maintain data integrity.',
        tags: ['role']
      }
    ],

    'farmer': [
      {
        id: 'farmer-1',
        question: 'How do I list my crops?',
        answer: 'Go to Dashboard → Marketplace → Add Product → Publish.',
        tags: ['sell', 'listing']
      },
      {
        id: 'farmer-2',
        question: 'What is Kisan AI?',
        answer: 'Kisan AI provides crop advice, disease detection, and pricing insights.',
        tags: ['ai', 'kisan']
      },
      {
        id: 'farmer-3',
        question: 'How do I receive payments?',
        answer: 'Payments are credited directly to your registered bank account.',
        tags: ['payments']
      }
    ],

    'buyer': [
      {
        id: 'buyer-1',
        question: 'How do I buy crops?',
        answer: 'Browse Marketplace → Select product → Place order.',
        tags: ['buy', 'order']
      },
      {
        id: 'buyer-2',
        question: 'Can I track product origin?',
        answer: 'Yes. Each product has blockchain-backed traceability.',
        tags: ['traceability']
      },
      {
        id: 'buyer-3',
        question: 'What if the product quality is poor?',
        answer: 'You can raise a dispute via the Help Center.',
        tags: ['complaint']
      }
    ],

    'admin': [
      {
        id: 'admin-1',
        question: 'How do admins verify farmers?',
        answer: 'Admins review farmer documents and approve accounts.',
        tags: ['verification']
      },
      {
        id: 'admin-2',
        question: 'Can admins block users?',
        answer: 'Yes. Admins can suspend or block accounts if needed.',
        tags: ['security']
      },
      {
        id: 'admin-3',
        question: 'How are disputes handled?',
        answer: 'Admins review evidence and resolve disputes fairly.',
        tags: ['disputes']
      }
    ]
  };

  /* ---------------- FILTER LOGIC ---------------- */

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

  get hasResults(): boolean {
    return Object.keys(this.filteredFaqs).length > 0;
  }

  /* ---------------- ACTIONS ---------------- */

  handleSearch(e: Event): void {
    e.preventDefault();
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
    this.searchInput.nativeElement.focus();
  }

  getCategoryTitle(key: string): string {
    return key.replace(/-/g, ' ');
  }
}
