package com.fitnesstracker.repository;

import com.fitnesstracker.model.Workout;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Thread-safe in-memory repository for {@link Workout} entities.
 * Supports user-scoped CRUD, filtering, sorting, and pagination.
 *
 * @author FitTrack Engineering
 */
@Repository
public class WorkoutRepository {

    private final Map<Long, Workout> store = new ConcurrentHashMap<>();
    private final AtomicLong idSequence = new AtomicLong(1L);

    /* ---------- Core CRUD ---------- */

    public Workout save(Workout workout) {
        if (workout.getId() == null) {
            workout.setId(idSequence.getAndIncrement());
        }
        store.put(workout.getId(), workout);
        return workout;
    }

    public Optional<Workout> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    public void deleteById(Long id) {
        store.remove(id);
    }

    /* ---------- User-Scoped Queries ---------- */

    /**
     * Returns all workouts belonging to a specific user.
     */
    public List<Workout> findAllByUserId(Long userId) {
        return store.values().stream()
                .filter(w -> userId.equals(w.getUserId()))
                .collect(Collectors.toList());
    }

    /**
     * Returns workouts for a user filtered by activity name (case-insensitive contains).
     */
    public List<Workout> findByUserIdAndActivityName(Long userId, String activityName) {
        return store.values().stream()
                .filter(w -> userId.equals(w.getUserId()))
                .filter(w -> w.getActivityName().toLowerCase()
                        .contains(activityName.toLowerCase()))
                .collect(Collectors.toList());
    }

    /**
     * Returns a sorted, paginated subset of a user's workouts.
     *
     * @param userId   the owner's ID
     * @param filter   optional activity name filter (nullable)
     * @param sortBy   field to sort by: activityName, duration, caloriesBurned, date
     * @param ascending sort direction
     * @param page     zero-based page index
     * @param size     page size
     * @return the matching workout list (single page)
     */
    public List<Workout> findPagedByUserId(Long userId, String filter,
                                            String sortBy, boolean ascending,
                                            int page, int size) {
        Stream<Workout> stream = store.values().stream()
                .filter(w -> userId.equals(w.getUserId()));

        // Apply optional activity name filter
        if (filter != null && !filter.isBlank()) {
            String lowerFilter = filter.toLowerCase();
            stream = stream.filter(w -> w.getActivityName().toLowerCase().contains(lowerFilter));
        }

        // Apply sorting
        Comparator<Workout> comparator = getComparator(sortBy);
        if (!ascending) {
            comparator = comparator.reversed();
        }
        stream = stream.sorted(comparator);

        // Apply pagination
        return stream
                .skip((long) page * size)
                .limit(size)
                .collect(Collectors.toList());
    }

    /**
     * Counts total workouts matching the criteria (for pagination metadata).
     */
    public long countByUserId(Long userId, String filter) {
        Stream<Workout> stream = store.values().stream()
                .filter(w -> userId.equals(w.getUserId()));

        if (filter != null && !filter.isBlank()) {
            String lowerFilter = filter.toLowerCase();
            stream = stream.filter(w -> w.getActivityName().toLowerCase().contains(lowerFilter));
        }
        return stream.count();
    }

    /* ---------- Internal ---------- */

    private Comparator<Workout> getComparator(String sortBy) {
        if (sortBy == null) sortBy = "date";
        return switch (sortBy.toLowerCase()) {
            case "activityname" -> Comparator.comparing(Workout::getActivityName,
                    String.CASE_INSENSITIVE_ORDER);
            case "duration"     -> Comparator.comparingInt(Workout::getDuration);
            case "caloriesburned", "calories" -> Comparator.comparingInt(Workout::getCaloriesBurned);
            default             -> Comparator.comparing(Workout::getDate);
        };
    }
}
