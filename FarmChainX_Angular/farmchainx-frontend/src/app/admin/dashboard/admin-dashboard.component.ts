import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { SupportService } from '../../core/services/support.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {

  loading = true;

  stats = {
    totalUsers: 0,
    activeCrops: 0,
    supportTickets: 0
  };

  constructor(
    private api: ApiService,
    private supportService: SupportService
  ) {}

  async ngOnInit() {
    try {
      /* ================= ADMIN STATS ================= */

      await this.api.getAdminStats().toPromise();

      const [farmers, distributors, consumers, admins, crops] =
        await Promise.all([
          this.api.getFarmers().toPromise(),
          this.api.getDistributors().toPromise(),
          this.api.getConsumers().toPromise(),
          this.api.getAdmins().toPromise(),
          this.api.getCrops().toPromise()
        ]);

      /* ================= SUPPORT TICKETS ================= */

      let ticketCount = 0;

      try {
        const statsRes = await this.supportService.getSupportStats().toPromise();
        ticketCount = statsRes?.stats?.totalTickets ?? 0;
      } catch {
        const ticketsRes = await this.supportService.getAllTickets().toPromise();
        const tickets = ticketsRes?.tickets ?? [];
        ticketCount = tickets.length;
      }

      /* ================= USERS ================= */

      const allUsers = [
        ...(farmers ?? []),
        ...(distributors ?? []),
        ...(consumers ?? []),
        ...(admins ?? [])
      ];

      /* ================= FINAL ================= */

      this.stats.totalUsers = allUsers.length;
      this.stats.activeCrops = Array.isArray(crops) ? crops.length : 0;
      this.stats.supportTickets = ticketCount;

      console.log('✅ Admin Dashboard Stats:', this.stats);

    } catch (err) {
      console.error('❌ Admin dashboard load error:', err);
    } finally {
      this.loading = false;
    }
  }
}
