import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { WorkoutService, Workout } from '../../services/workout.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
  workouts: Workout[] = [];
  isLoading = true;

  // ----- Calories per Month (Bar Chart) -----
  barChartType: ChartType = 'bar';
  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: '#ccc', font: { size: 13 } } },
      title: { display: true, text: 'Calories Burned per Month', color: '#fff', font: { size: 16, weight: 'bold' } }
    },
    scales: {
      x: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
    }
  };

  // ----- Activity Distribution (Doughnut Chart) -----
  doughnutChartType: ChartType = 'doughnut';
  doughnutChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#ccc', font: { size: 13 }, padding: 16 } },
      title: { display: true, text: 'Activity Distribution', color: '#fff', font: { size: 16, weight: 'bold' } }
    }
  };

  // ----- Weekly Calories Trend (Line Chart) -----
  lineChartType: ChartType = 'line';
  lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: '#ccc', font: { size: 13 } } },
      title: { display: true, text: 'Weekly Calorie Burn Trend', color: '#fff', font: { size: 16, weight: 'bold' } }
    },
    scales: {
      x: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
    },
    elements: {
      line: { tension: 0.4 },
      point: { radius: 5, hoverRadius: 8 }
    }
  };

  // ----- Duration per Activity (Horizontal Bar) -----
  hBarChartType: ChartType = 'bar';
  hBarChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  hBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: true, labels: { color: '#ccc', font: { size: 13 } } },
      title: { display: true, text: 'Total Duration per Activity (min)', color: '#fff', font: { size: 16, weight: 'bold' } }
    },
    scales: {
      x: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
      y: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  // Summary stats
  totalWorkouts = 0;
  totalCalories = 0;
  totalDuration = 0;
  avgCaloriesPerWorkout = 0;

  constructor(private workoutService: WorkoutService) {}

  ngOnInit(): void {
    this.workoutService.getWorkouts().subscribe(data => {
      this.workouts = data;
      this.computeStats();
      this.buildCaloriesPerMonthChart();
      this.buildActivityDistributionChart();
      this.buildWeeklyTrendChart();
      this.buildDurationPerActivityChart();
      this.isLoading = false;
    });
  }

  private computeStats(): void {
    this.totalWorkouts = this.workouts.length;
    this.totalCalories = this.workouts.reduce((s, w) => s + w.caloriesBurned, 0);
    this.totalDuration = this.workouts.reduce((s, w) => s + w.duration, 0);
    this.avgCaloriesPerWorkout = this.totalWorkouts ? Math.round(this.totalCalories / this.totalWorkouts) : 0;
  }

  // =========== CHART BUILDERS ===========

  private buildCaloriesPerMonthChart(): void {
    const monthMap = new Map<string, number>();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    this.workouts.forEach(w => {
      const d = new Date(w.date);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthMap.set(key, (monthMap.get(key) || 0) + w.caloriesBurned);
    });

    // Sort by date
    const sorted = [...monthMap.entries()].sort((a, b) => {
      const parseKey = (k: string) => {
        const [mon, yr] = k.split(' ');
        return new Date(`${mon} 1, ${yr}`).getTime();
      };
      return parseKey(a[0]) - parseKey(b[0]);
    });

    this.barChartData = {
      labels: sorted.map(e => e[0]),
      datasets: [{
        label: 'Calories Burned',
        data: sorted.map(e => e[1]),
        backgroundColor: 'rgba(0, 212, 255, 0.6)',
        borderColor: '#00d4ff',
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(0, 212, 255, 0.85)'
      }]
    };
  }

  private buildActivityDistributionChart(): void {
    const actMap = new Map<string, number>();
    this.workouts.forEach(w => {
      actMap.set(w.activityName, (actMap.get(w.activityName) || 0) + 1);
    });

    const colors = [
      '#00d4ff', '#00ff88', '#a855f7', '#ff9d00', '#ff4757',
      '#2ed573', '#ffa502', '#1e90ff', '#ff6b81', '#7bed9f'
    ];

    this.doughnutChartData = {
      labels: [...actMap.keys()],
      datasets: [{
        data: [...actMap.values()],
        backgroundColor: colors.slice(0, actMap.size),
        borderColor: '#1a1a2e',
        borderWidth: 3,
        hoverOffset: 10
      }]
    };
  }

  private buildWeeklyTrendChart(): void {
    const weekMap = new Map<string, number>();

    this.workouts.forEach(w => {
      const d = new Date(w.date);
      const weekStart = this.getWeekStart(d);
      const key = weekStart.toISOString().split('T')[0];
      weekMap.set(key, (weekMap.get(key) || 0) + w.caloriesBurned);
    });

    const sorted = [...weekMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    // Format labels as "MMM DD"
    const labels = sorted.map(e => {
      const d = new Date(e[0]);
      return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
    });

    this.lineChartData = {
      labels,
      datasets: [{
        label: 'Calories Burned',
        data: sorted.map(e => e[1]),
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0, 255, 136, 0.1)',
        fill: true,
        pointBackgroundColor: '#00ff88',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    };
  }

  private buildDurationPerActivityChart(): void {
    const durMap = new Map<string, number>();
    this.workouts.forEach(w => {
      durMap.set(w.activityName, (durMap.get(w.activityName) || 0) + w.duration);
    });

    const sorted = [...durMap.entries()].sort((a, b) => b[1] - a[1]);

    const colors = [
      'rgba(168, 85, 247, 0.7)', 'rgba(0, 212, 255, 0.7)', 'rgba(0, 255, 136, 0.7)',
      'rgba(255, 157, 0, 0.7)', 'rgba(255, 71, 87, 0.7)', 'rgba(46, 213, 115, 0.7)'
    ];

    this.hBarChartData = {
      labels: sorted.map(e => e[0]),
      datasets: [{
        label: 'Duration (min)',
        data: sorted.map(e => e[1]),
        backgroundColor: colors.slice(0, sorted.length),
        borderColor: colors.map(c => c.replace('0.7', '1')),
        borderWidth: 2,
        borderRadius: 6
      }]
    };
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
