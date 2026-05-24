import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';

@Component({
  selector: 'app-add-activity',
  templateUrl: './add-activity.component.html',
  styleUrls: ['./add-activity.component.css']
})
export class AddActivityComponent {
  workoutForm: FormGroup;
  alertMessage: string | null = null;
  alertClass: string = 'alert-success';
  isSubmitting = false;

  today: string;

  constructor(
    private fb: FormBuilder,
    private workoutService: WorkoutService,
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
    // Compare as plain date strings (YYYY-MM-DD) to avoid timezone issues
    const selectedStr = control.value; // already 'YYYY-MM-DD'
    const todayStr = new Date().toISOString().split('T')[0];
    return selectedStr > todayStr ? { futureDate: true } : null;
  }

  onSubmit(): void {
    if (this.workoutForm.invalid) return;
    this.isSubmitting = true;
    this.workoutService.addWorkout(this.workoutForm.value).subscribe({
      next: () => {
        this.showAlert('Activity added successfully!', 'success');
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: () => {
        this.showAlert('Failed to add activity. Please try again.', 'danger');
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
