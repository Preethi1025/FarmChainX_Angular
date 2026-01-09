import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

/* ================== MODELS ================== */

export interface TicketMessage {
  id: number;
  senderId: string;
  senderRole: string;
  message: string;
  isAdminResponse: boolean;
  createdAt: string;
}

export interface Ticket {
  id: number;                 // DB ID (Long)
  ticketId: string;           // TKT-xxxx
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: string;
  issueType: string;
  reportedById: string;
  reportedByRole: string;
  createdAt: string;
  messages?: TicketMessage[];
}

export interface SupportStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
}

/* ================== SERVICE ================== */

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  private baseUrl = 'http://localhost:8080/api/support';

  constructor(private http: HttpClient) {}

  /* ---------- HEADERS ---------- */
  private getHeaders(): HttpHeaders {
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: admin?.token ? `Bearer ${admin.token}` : ''
    });
  }

  /* ---------- TICKETS ---------- */

  createTicket(ticketData: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/tickets`,
      ticketData,
      { headers: this.getHeaders() }
    );
  }

  getAllTickets(): Observable<{ success: boolean; tickets: Ticket[] }> {
    return this.http.get<{ success: boolean; tickets: Ticket[] }>(
      `${this.baseUrl}/tickets/all`,
      { headers: this.getHeaders() }
    );
  }

  updateTicketStatus(ticketId: number, status: string): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/tickets/${ticketId}/status`,
      { status },
      { headers: this.getHeaders() }
    );
  }

  /* ---------- MESSAGES ---------- */

  getTicketMessages(ticketId: number): Observable<{ messages: TicketMessage[] }> {
    return this.http.get<{ messages: TicketMessage[] }>(
      `${this.baseUrl}/tickets/${ticketId}/messages`,
      { headers: this.getHeaders() }
    );
  }

  addMessageToTicket(ticketId: number, payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/tickets/${ticketId}/messages`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  /* ---------- STATS ---------- */

  getSupportStats(): Observable<{ stats: SupportStats }> {
    return this.http.get<{ stats: SupportStats }>(
      `${this.baseUrl}/stats`,
      { headers: this.getHeaders() }
    );
  }
}
