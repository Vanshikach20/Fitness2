import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Workout {
  id?: number;
  userId?: number;
  activityName: string;
  duration: number;
  caloriesBurned: number;
  date: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/**
 * Service for workout CRUD operations.
 * JWT token is automatically attached by the AuthInterceptor.
 */
@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private readonly apiUrl = 'http://localhost:8080/api/workouts';

  constructor(private http: HttpClient) {}

  /** Paginated, sorted, filterable workout list */
  getWorkoutsPaged(
    page = 0,
    size = 10,
    sortBy = 'date',
    ascending = false,
    filter?: string
  ): Observable<PageResponse<Workout>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('ascending', ascending);

    if (filter && filter.trim()) {
      params = params.set('filter', filter.trim());
    }
    return this.http.get<PageResponse<Workout>>(this.apiUrl, { params });
  }

  /** All workouts (unpaginated) — used for analytics and stats */
  getWorkouts(): Observable<Workout[]> {
    return this.http.get<Workout[]>(`${this.apiUrl}/all`);
  }

  getMonthlyCalories(year: number, month: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/summary/monthly`, {
      params: new HttpParams().set('year', year).set('month', month),
    });
  }

  addWorkout(workout: Workout): Observable<Workout> {
    return this.http.post<Workout>(this.apiUrl, workout);
  }

  updateWorkout(workout: Workout): Observable<Workout> {
    return this.http.put<Workout>(`${this.apiUrl}/${workout.id}`, workout);
  }

  deleteWorkout(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}