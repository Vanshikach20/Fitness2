package com.fitnesstracker.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;
import java.util.Objects;

/**
 * Represents a single fitness workout entry owned by a specific user.
 *
 * @author FitTrack Engineering
 */
public class Workout {

    private Long id;
    private Long userId;

    @NotBlank(message = "Activity name is required")
    private String activityName;

    @Min(value = 1, message = "Duration must be at least 1 minute")
    private int duration;

    @Min(value = 1, message = "Calories burned must be at least 1")
    private int caloriesBurned;

    @NotNull(message = "Date is required")
    @PastOrPresent(message = "Date cannot be in the future")
    private LocalDate date;

    public Workout() {}

    public Workout(Long id, Long userId, String activityName,
                   int duration, int caloriesBurned, LocalDate date) {
        this.id = id;
        this.userId = userId;
        this.activityName = activityName;
        this.duration = duration;
        this.caloriesBurned = caloriesBurned;
        this.date = date;
    }

    /* ---------- Getters & Setters ---------- */

    public Long getId()                                  { return id; }
    public void setId(Long id)                           { this.id = id; }

    public Long getUserId()                              { return userId; }
    public void setUserId(Long userId)                   { this.userId = userId; }

    public String getActivityName()                      { return activityName; }
    public void setActivityName(String activityName)     { this.activityName = activityName; }

    public int getDuration()                             { return duration; }
    public void setDuration(int duration)                { this.duration = duration; }

    public int getCaloriesBurned()                       { return caloriesBurned; }
    public void setCaloriesBurned(int caloriesBurned)    { this.caloriesBurned = caloriesBurned; }

    public LocalDate getDate()                           { return date; }
    public void setDate(LocalDate date)                  { this.date = date; }

    /* ---------- Identity ---------- */

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Workout workout = (Workout) o;
        return Objects.equals(id, workout.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return String.format("Workout{id=%d, userId=%d, activity='%s', duration=%d, calories=%d, date=%s}",
                id, userId, activityName, duration, caloriesBurned, date);
    }
}
