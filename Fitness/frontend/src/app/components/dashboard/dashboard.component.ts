import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutService, Workout, PageResponse } from '../../services/workout.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  /* ---------- User ---------- */
  userName = '';

  /* ---------- Data ---------- */
  workouts: Workout[] = [];
  allWorkouts: Workout[] = [];
  monthlyCalories = 0;

  /* ---------- Pagination ---------- */
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  isFirst = true;
  isLast = true;

  /* ---------- Sorting ---------- */
  sortBy = 'date';
  ascending = false;

  /* ---------- Filter ---------- */
  activityFilter = '';

  /* ---------- UI State ---------- */
  alertMessage: string | null = null;
  alertClass = 'alert-success';

  constructor(
    private workoutService: WorkoutService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getUser()?.fullName || 'User';
    this.loadWorkoutsPaged();
    this.loadAllWorkoutsForStats();
    this.loadMonthlyCalories();
  }

  /* ==================== Data Loading ==================== */

  loadWorkoutsPaged(): void {
    this.workoutService.getWorkoutsPaged(
      this.currentPage, this.pageSize, this.sortBy, this.ascending, this.activityFilter
    ).subscribe({
      next: (page: PageResponse<Workout>) => {
        this.workouts = page.content;
        this.totalElements = page.totalElements;
        this.totalPages = page.totalPages;
        this.isFirst = page.first;
        this.isLast = page.last;
      },
      error: () => this.showAlert('Failed to load workouts.', 'danger')
    });
  }

  loadAllWorkoutsForStats(): void {
    this.workoutService.getWorkouts().subscribe({
      next: (data) => { this.allWorkouts = data; },
      error: () => {}
    });
  }

  loadMonthlyCalories(): void {
    const now = new Date();
    this.workoutService.getMonthlyCalories(now.getFullYear(), now.getMonth() + 1).subscribe({
      next: (calories) => { this.monthlyCalories = calories; },
      error: () => {}
    });
  }

  /* ==================== Pagination ==================== */

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadWorkoutsPaged();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  /* ==================== Sorting ==================== */

  sortColumn(column: string): void {
    if (this.sortBy === column) {
      this.ascending = !this.ascending;
    } else {
      this.sortBy = column;
      this.ascending = true;
    }
    this.currentPage = 0;
    this.loadWorkoutsPaged();
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) return 'unfold_more';
    return this.ascending ? 'arrow_upward' : 'arrow_downward';
  }

  /* ==================== Filtering ==================== */

  filterByActivity(): void {
    this.currentPage = 0;
    this.loadWorkoutsPaged();
  }

  /* ==================== Actions ==================== */

  editWorkout(workout: Workout): void {
    this.router.navigate(['/edit-activity', workout.id], { state: { workout } });
  }

  deleteWorkout(id: number): void {
    if (confirm('Are you sure you want to delete this workout?')) {
      this.workoutService.deleteWorkout(id).subscribe({
        next: () => {
          this.loadWorkoutsPaged();
          this.loadAllWorkoutsForStats();
          this.loadMonthlyCalories();
          this.showAlert('Workout deleted successfully!', 'info');
        },
        error: () => this.showAlert('Failed to delete workout.', 'danger')
      });
    }
  }

  /* ==================== Stats (from all workouts) ==================== */

  get totalDuration(): number {
    return this.allWorkouts.reduce((sum, w) => sum + w.duration, 0);
  }

  get totalCalories(): number {
    return this.allWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
  }

  get totalWorkoutCount(): number {
    return this.allWorkouts.length;
  }

  /* ==================== Alert ==================== */

  showAlert(message: string, type: 'success' | 'danger' | 'info' = 'success'): void {
    this.alertMessage = message;
    this.alertClass = 'alert-' + type;
    setTimeout(() => this.alertMessage = null, 3000);
  }
}
