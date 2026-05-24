package com.fitnesstracker.controller;

import com.fitnesstracker.dto.PageResponse;
import com.fitnesstracker.model.Workout;
import com.fitnesstracker.security.JwtUtil;
import com.fitnesstracker.service.WorkoutService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for workout CRUD operations.
 * All endpoints require a valid JWT. Data is scoped to the authenticated user.
 * Supports pagination, sorting, and filtering.
 *
 * @author FitTrack Engineering
 */
@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private static final Logger log = LoggerFactory.getLogger(WorkoutController.class);

    private final WorkoutService workoutService;
    private final JwtUtil jwtUtil;

    public WorkoutController(WorkoutService workoutService, JwtUtil jwtUtil) {
        this.workoutService = workoutService;
        this.jwtUtil = jwtUtil;
    }

    /* ==================== Paginated List ==================== */

    /**
     * GET /api/workouts?page=0&size=10&sortBy=date&ascending=false&filter=running
     * Returns a paginated, sorted list of the user's workouts.
     */
    @GetMapping
    public ResponseEntity<PageResponse<Workout>> getWorkoutsPaged(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "false") boolean ascending,
            @RequestParam(required = false) String filter) {

        Long userId = extractUserId(authHeader);
        log.debug("Fetching workouts for user={} page={} size={} sort={} asc={} filter={}",
                userId, page, size, sortBy, ascending, filter);

        PageResponse<Workout> response = workoutService.getWorkoutsPaged(
                userId, filter, sortBy, ascending, page, size);
        return ResponseEntity.ok(response);
    }

    /* ==================== All (for analytics) ==================== */

    /**
     * GET /api/workouts/all — Returns all workouts (unpaginated) for analytics.
     */
    @GetMapping("/all")
    public ResponseEntity<List<Workout>> getAllWorkouts(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(workoutService.getAllWorkouts(userId));
    }

    /* ==================== Single Workout ==================== */

    /**
     * GET /api/workouts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Workout> getWorkoutById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {

        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(workoutService.getWorkoutById(userId, id));
    }

    /* ==================== Create ==================== */

    /**
     * POST /api/workouts
     */
    @PostMapping
    public ResponseEntity<Workout> addWorkout(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody Workout workout) {

        Long userId = extractUserId(authHeader);
        Workout created = workoutService.addWorkout(userId, workout);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /* ==================== Update ==================== */

    /**
     * PUT /api/workouts/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Workout> updateWorkout(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @Valid @RequestBody Workout workout) {

        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(workoutService.updateWorkout(userId, id, workout));
    }

    /* ==================== Delete ==================== */

    /**
     * DELETE /api/workouts/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkout(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {

        Long userId = extractUserId(authHeader);
        workoutService.deleteWorkout(userId, id);
        return ResponseEntity.noContent().build();
    }

    /* ==================== Monthly Summary ==================== */

    /**
     * GET /api/workouts/summary/monthly?year=2026&month=4
     */
    @GetMapping("/summary/monthly")
    public ResponseEntity<Integer> getMonthlyCaloriesSummary(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam int year,
            @RequestParam int month) {

        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(workoutService.getMonthlyCaloriesSummary(userId, year, month));
    }

    /* ==================== Internal ==================== */

    private Long extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtUtil.extractUserId(token);
    }
}
