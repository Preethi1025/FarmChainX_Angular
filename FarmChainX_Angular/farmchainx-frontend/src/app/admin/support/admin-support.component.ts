import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportService, Ticket } from '../../core/services/support.service';

type TicketTab = 'all' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

@Component({
  selector: 'app-admin-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-support.component.html'
})
export class AdminSupportComponent implements OnInit {

  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  selectedTicket: Ticket | null = null;

  message = '';
  loading = true;
  stats: any;

  tabs: readonly TicketTab[] = ['all', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];
  activeTab: TicketTab = 'all';

  constructor(private support: SupportService) {}

  ngOnInit(): void {
    this.loadTickets();
    this.loadStats();
  }

  /* ---------- LOADERS ---------- */

  loadTickets(): void {
    this.loading = true;

    this.support.getAllTickets().subscribe({
      next: res => {
        const list: Ticket[] = res?.tickets ?? [];
        console.log('✅ ADMIN TICKETS:', list);

        this.tickets = list;
        this.applyFilter();
      },
      complete: () => this.loading = false
    });
  }

  loadStats(): void {
    this.support.getSupportStats().subscribe(res => {
      this.stats = res?.stats ?? res;
    });
  }

  /* ---------- FILTER ---------- */

  applyFilter(): void {
    if (this.activeTab === 'all') {
      this.filteredTickets = [...this.tickets];
    } else {
      this.filteredTickets = this.tickets.filter(
        t => t.status === this.activeTab
      );
    }
  }

  setTab(tab: TicketTab): void {
    this.activeTab = tab;
    this.applyFilter();
  }

  /* ---------- DETAILS ---------- */

  selectTicket(ticket: Ticket): void {
    this.selectedTicket = ticket;

    this.support.getTicketMessages(ticket.id).subscribe(res => {
      this.selectedTicket!.messages = res?.messages ?? [];
    });
  }

  updateStatus(status: string): void {
    if (!this.selectedTicket) return;

    this.support.updateTicketStatus(this.selectedTicket.id, status).subscribe(() => {
      this.selectedTicket!.status = status as any;
      this.loadTickets();
    });
  }

  sendMessage(): void {
    if (!this.message.trim() || !this.selectedTicket) return;

    const admin = JSON.parse(localStorage.getItem('admin') || '{}');

    const payload = {
      senderId: admin.id || '1',
      senderRole: 'ADMIN',
      message: this.message,
      isAdminResponse: true
    };

    this.support
      .addMessageToTicket(this.selectedTicket.id, payload)
      .subscribe(() => {
        this.message = '';
        this.selectTicket(this.selectedTicket!);
      });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
}
