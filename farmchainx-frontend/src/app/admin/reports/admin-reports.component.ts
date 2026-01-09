import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  templateUrl: './admin-reports.component.html'
})
export class AdminReportsComponent implements AfterViewInit {

  @ViewChild('userPie') userPie!: ElementRef<HTMLCanvasElement>;
  @ViewChild('userBar') userBar!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cropBar') cropBar!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cropPie') cropPie!: ElementRef<HTMLCanvasElement>;

  stats: any;
  crops: any[] = [];

  // ✅ STORE CHART INSTANCES
  private charts: Chart[] = [];

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.loadData();
  }

  loadData() {
    this.http.get<any>('http://localhost:8080/api/admin/stats')
      .subscribe(stats => {
        this.stats = stats;

        this.http.get<any[]>('http://localhost:8080/api/admin/crops')
          .subscribe(crops => {
            this.crops = crops;

            // ✅ WAIT FOR DOM PAINT
            setTimeout(() => this.renderCharts(), 0);
          });
      });
  }

  renderCharts() {
    this.destroyCharts();
    this.renderUserCharts();
    this.renderCropCharts();
  }

  destroyCharts() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  renderUserCharts() {
    const userData = [
      this.stats.farmers,
      this.stats.distributors,
      this.stats.consumers,
      this.stats.admins
    ];

    this.charts.push(
      new Chart(this.userPie.nativeElement, {
        type: 'pie',
        data: {
          labels: ['Farmers', 'Distributors', 'Consumers', 'Admins'],
          datasets: [{
            data: userData,
            backgroundColor: ['#6366f1', '#22c55e', '#a855f7', '#ef4444']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })
    );

    this.charts.push(
      new Chart(this.userBar.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Farmers', 'Distributors', 'Consumers', 'Admins'],
          datasets: [{
            label: 'Users',
            data: userData,
            backgroundColor: '#6366f1'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })
    );
  }

  renderCropCharts() {
    const map: Record<string, number> = {};

    this.crops.forEach(c => {
      map[c.cropName] = (map[c.cropName] || 0) + 1;
    });

    const labels = Object.keys(map);
    const values = Object.values(map);

    this.charts.push(
      new Chart(this.cropBar.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Crops',
            data: values,
            backgroundColor: '#f97316'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })
    );

    this.charts.push(
      new Chart(this.cropPie.nativeElement, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: [
              '#6366f1',
              '#22c55e',
              '#a855f7',
              '#ef4444',
              '#f97316',
              '#14b8a6'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })
    );
  }
}
