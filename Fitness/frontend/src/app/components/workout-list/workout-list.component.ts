import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkoutService, Workout } from '../../services/workout.service';

@Component({
  selector: 'app-workout-list',
  templateUrl: './workout-list.component.html',
  styleUrls: ['./workout-list.component.css']
})
export class WorkoutListComponent implements OnInit {
  workouts: Workout[] = [];
  filteredWorkouts: Workout[] = [];
  workoutForm: FormGroup;
  editMode = false;
  selectedWorkoutId: number | null = null;
  monthlyCalories: number = 0;
  activityFilter: string = '';
  alertMessage: string | null = null;
  alertClass: string = 'alert-success';

  constructor(private workoutService: WorkoutService, private fb: FormBuilder) {
    this.workoutForm = this.fb.group({
      activityName: ['', Validators.required],
      duration: [0, [Validators.required, Validators.min(1)]],
      caloriesBurned: [0, [Validators.required, Validators.min(1)]],
      date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadWorkouts();
    this.loadMonthlyCalories();
  }

  loadWorkouts(): void {
    this.workoutService.getWorkouts().subscribe(data => {
      this.workouts = data;
      if (this.activityFilter && this.activityFilter.trim()) {
        const filter = this.activityFilter.trim().toLowerCase();
        this.filteredWorkouts = data.filter(w =>
          w.activityName.toLowerCase().includes(filter));
      } else {
        this.filteredWorkouts = data;
      }
    });
  }

  loadMonthlyCalories(): void {
    const now = new Date();
    this.workoutService.getMonthlyCalories(now.getFullYear(), now.getMonth() + 1).subscribe(calories => {
      this.monthlyCalories = calories;
    });
  }

  filterByActivity(): void {
    this.loadWorkouts();
  }

  onSubmit(): void {
    if (this.workoutForm.invalid) return;
    const workout: Workout = this.workoutForm.value;
    if (this.editMode && this.selectedWorkoutId !== null) {
      workout.id = this.selectedWorkoutId;
      this.workoutService.updateWorkout(workout).subscribe(() => {
        this.loadWorkouts();
        this.loadMonthlyCalories();
        this.showAlert('Workout updated successfully!', 'info');
        this.resetForm();
      }, () => this.showAlert('Failed to update workout', 'danger'));
    } else {
      this.workoutService.addWorkout(workout).subscribe(() => {
        this.loadWorkouts();
        this.loadMonthlyCalories();
        this.showAlert('Workout added successfully!', 'success');
        this.resetForm();
      }, () => this.showAlert('Failed to add workout', 'danger'));
    }
  }

  editWorkout(workout: Workout): void {
    this.editMode = true;
    this.selectedWorkoutId = workout.id!;
    this.workoutForm.patchValue(workout);
  }

  deleteWorkout(id: number): void {
    this.workoutService.deleteWorkout(id).subscribe(() => {
      this.loadWorkouts();
      this.loadMonthlyCalories();
      this.showAlert('Workout deleted!', 'danger');
      this.resetForm();
    }, () => this.showAlert('Failed to delete workout', 'danger'));
  }

  resetForm(): void {
    this.editMode = false;
    this.selectedWorkoutId = null;
    this.workoutForm.reset();
  }

  showAlert(message: string, type: 'success' | 'danger' | 'info' = 'success') {
    this.alertMessage = message;
    this.alertClass = 'alert-' + type;
    setTimeout(() => this.alertMessage = null, 3000);
  }

  get workoutsToDisplay() {
    return this.filteredWorkouts;
  }
}