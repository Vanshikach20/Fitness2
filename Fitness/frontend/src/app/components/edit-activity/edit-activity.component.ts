import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutService, Workout } from '../../services/workout.service';

@Component({
  selector: 'app-edit-activity',
  templateUrl: './edit-activity.component.html',
  styleUrls: ['./edit-activity.component.css']
})
export class EditActivityComponent implements OnInit {
  workoutForm: FormGroup;
  workoutId: number | null = null;
  alertMessage: string | null = null;
  alertClass: string = 'alert-success';
  isSubmitting = false;
  isLoading = true;
  today: string;

  constructor(
    private fb: FormBuilder,
    private workoutService: WorkoutService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.today = new Date().toISOString().split('T')[0];
    this.workoutForm = this.fb.group({
      activityName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z\s\-]+$/)
      ]],
      duration: [null, [
        Validators.required,
        Validators.min(1),
        Validators.max(1440)
      ]],
      caloriesBurned: [null, [
        Validators.required,
        Validators.min(1),
        Validators.max(50000)
      ]],
      date: ['', [Validators.required, this.futureDateValidator.bind(this)]]
    });
  }

  futureDateValidator(control: any) {
    if (!control.value) return null;
    const selectedStr = control.value;
    const todayStr = new Date().toISOString().split('T')[0];
    return selectedStr > todayStr ? { futureDate: true } : null;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.workoutId = +idParam;
    }

    // Try to get workout from router state first
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { workout: Workout } | undefined;
    if (state?.workout) {
      this.populateForm(state.workout);
      this.isLoading = false;
    } else {
      // Check history state
      const historyState = history.state as { workout?: Workout };
      if (historyState?.workout) {
        this.populateForm(historyState.workout);
        this.isLoading = false;
      } else {
        // Fallback: fetch all workouts and find the one with matching id
        this.workoutService.getWorkouts().subscribe(workouts => {
          const found = workouts.find(w => w.id === this.workoutId);
          if (found) {
            this.populateForm(found);
          } else {
            this.showAlert('Workout not found!', 'danger');
          }
          this.isLoading = false;
        });
      }
    }
  }

  populateForm(workout: Workout): void {
    this.workoutForm.patchValue({
      activityName: workout.activityName,
      duration: workout.duration,
      caloriesBurned: workout.caloriesBurned,
      date: workout.date
    });
  }

  onSubmit(): void {
    if (this.workoutForm.invalid || this.workoutId === null) return;
    this.isSubmitting = true;
    const workout: Workout = { ...this.workoutForm.value, id: this.workoutId };
    this.workoutService.updateWorkout(workout).subscribe({
      next: () => {
        this.showAlert('Activity updated successfully!', 'success');
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: () => {
        this.showAlert('Failed to update activity.', 'danger');
        this.isSubmitting = false;
      }
    });
  }

  showAlert(message: string, type: 'success' | 'danger' | 'info' = 'success'): void {
    this.alertMessage = message;
    this.alertClass = 'alert-' + type;
    setTimeout(() => this.alertMessage = null, 3000);
  }
}
