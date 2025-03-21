import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatisticsService } from '../../core/services/statistics.service';
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  loading = true;
  
  constructor(private statisticsService: StatisticsService) {}
  
  ngOnInit(): void {
    this.loadStatistics();
  }
  
  loadStatistics(): void {
    this.loading = true;
    // Use basic stats since detailed stats require extra API calls
    this.statisticsService.getStatistics().subscribe({
      next: (data) => {
        console.log('Statistics loaded:', data);
        this.stats = data;
        this.loading = false;
        
        // Allow DOM to update before rendering charts
        setTimeout(() => {
          this.renderCharts();
        }, 0);
      },
      error: (err) => {
        console.error('Failed to load statistics', err);
        this.loading = false;
      }
    });
  }
  
  renderCharts(): void {
    this.renderBookTypeChart();
    this.renderBookStatusChart();
    this.renderActivityChart();
  }
  
  renderBookTypeChart(): void {
    if (!this.stats?.booksByType) return;
    
    const ctx = document.getElementById('bookTypeChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    const labels = Object.keys(this.stats.booksByType)
      .map(key => key.replace('_', ' '));
    const data = Object.values(this.stats.booksByType);
    
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 206, 86, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          }
        }
      }
    });
  }
  
  renderBookStatusChart(): void {
    if (!this.stats?.booksByStatus) return;
    
    const ctx = document.getElementById('bookStatusChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    const labels = Object.keys(this.stats.booksByStatus);
    const data = Object.values(this.stats.booksByStatus);
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            'rgba(255, 206, 86, 0.8)',   // PENDING
            'rgba(54, 162, 235, 0.8)',   // GENERATING
            'rgba(75, 192, 192, 0.8)',   // COMPLETED
            'rgba(255, 99, 132, 0.8)'    // FAILED
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          }
        }
      }
    });
  }
  
  renderActivityChart(): void {
    if (!this.stats?.creationActivity) return;
    
    const ctx = document.getElementById('activityChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    const labels = this.stats.creationActivity.map((item: any) => {
      const [year, month] = item.month.split('-');
      return `${month}/${year}`;
    });
    
    const conversationData = this.stats.creationActivity.map((item: any) => item.conversations);
    const bookData = this.stats.creationActivity.map((item: any) => item.books);
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Conversations',
            data: conversationData,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.3
          },
          {
            label: 'Books',
            data: bookData,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Month'
            }
          }
        }
      }
    });
  }
}