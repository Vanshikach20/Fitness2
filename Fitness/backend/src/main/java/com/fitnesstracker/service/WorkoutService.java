package com.fitnesstracker.service;

import com.fitnesstracker.dto.PageResponse;
import com.fitnesstracker.exception.BadRequestException;
import com.fitnesstracker.exception.ResourceNotFoundException;
import com.fitnesstracker.model.Workout;
import com.fitnesstracker.repository.WorkoutRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Business logic layer for workout operations.
 * All operations are scoped to the authenticated user — a user can only
 * view, create, update, or delete their own workouts.
 *
 * @author FitTrack Engineering
 */
@Service
public class WorkoutService {

    private static final Logger log = LoggerFactory.getLogger(WorkoutService.class);

    private final WorkoutRepository workoutRepository;

    public WorkoutService(WorkoutRepository workoutRepository) {
        this.workoutRepository = workoutRepository;
    }

    /**
     * Returns a paginated, sorted list of the user's workouts.
     */
    public PageResponse<Workout> getWorkoutsPaged(Long userId, String filter,
                                                   String sortBy, boolean ascending,
                                                   int page, int size) {
        List<Workout> content = workoutRepository.findPagedByUserId(
                userId, filter, sortBy, ascending, page, size);
        long total = workoutRepository.countByUserId(userId, filter);
        int totalPages = (int) Math.ceil((double) total / size);

        return new PageResponse<>(
                content, page, size, total, totalPages,
                page == 0,
                page >= totalPages - 1
        );
    }

    /**
     * Returns all workouts for the user (unpaginated — used for analytics).
     */
    public List<Workout> getAllWorkouts(Long userId) {
        return workoutRepository.findAllByUserId(userId);
    }

    /**
     * Returns workouts filtered by activity name.
     */
    public List<Workout> filterByActivityName(Long userId, String activityName) {
        return workoutRepository.findByUserIdAndActivityName(userId, activityName);
    }

    /**
     * Retrieves a single workout, verifying ownership.
     */
    public Workout getWorkoutById(Long userId, Long workoutId) {
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout", workoutId));
        verifyOwnership(workout, userId);
        return workout;
    }

    /**
     * Creates a new workout for the authenticated user.
     */
    public Workout addWorkout(Long userId, Workout workout) {
        workout.setUserId(userId);
        Workout saved = workoutRepository.save(workout);
        log.info("Workout created: id={} for user={}", saved.getId(), userId);
        return saved;
    }

    /**
     * Updates an existing workout, verifying ownership.
     */
    public Workout updateWorkout(Long userId, Long workoutId, Workout updated) {
        Workout existing = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout", workoutId));
        verifyOwnership(existing, userId);

        existing.setActivityName(updated.getActivityName());
        existing.setDuration(updated.getDuration());
        existing.setCaloriesBurned(updated.getCaloriesBurned());
        existing.setDate(updated.getDate());

        Workout saved = workoutRepository.save(existing);
        log.info("Workout updated: id={} for user={}", saved.getId(), userId);
        return saved;
    }

    /**
     * Deletes a workout, verifying ownership.
     */
    public void deleteWorkout(Long userId, Long workoutId) {
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout", workoutId));
        verifyOwnership(workout, userId);

        workoutRepository.deleteById(workoutId);
        log.info("Workout deleted: id={} for user={}", workoutId, userId);
    }

    /**
     * Returns total calories burned in a specific month for the user.
     */
    public int getMonthlyCaloriesSummary(Long userId, int year, int month) {
        return workoutRepository.findAllByUserId(userId).stream()
                .filter(w -> w.getDate().getYear() == year && w.getDate().getMonthValue() == month)
                .mapToInt(Workout::getCaloriesBurned)
                .sum();
    }

    /* ---------- Internal ---------- */

    private void verifyOwnership(Workout workout, Long userId) {
        if (!userId.equals(workout.getUserId())) {
            throw new BadRequestException("You do not have permission to access this workout");
        }
    }
}
