package com.fitnesstracker.model;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Represents a registered user in the FitTrack system.
 * Each user owns their own set of workouts.
 *
 * @author FitTrack Engineering
 */
public class User {

    private Long id;
    private String fullName;
    private String email;
    private String password;  // Stored as BCrypt hash
    private LocalDateTime createdAt;

    public User() {
        this.createdAt = LocalDateTime.now();
    }

    public User(Long id, String fullName, String email, String password) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.createdAt = LocalDateTime.now();
    }

    /* ---------- Getters & Setters ---------- */

    public Long getId()                          { return id; }
    public void setId(Long id)                   { this.id = id; }

    public String getFullName()                  { return fullName; }
    public void setFullName(String fullName)      { this.fullName = fullName; }

    public String getEmail()                     { return email; }
    public void setEmail(String email)           { this.email = email; }

    public String getPassword()                  { return password; }
    public void setPassword(String password)     { this.password = password; }

    public LocalDateTime getCreatedAt()          { return createdAt; }
    public void setCreatedAt(LocalDateTime ts)   { this.createdAt = ts; }

    /* ---------- Identity ---------- */

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return String.format("User{id=%d, fullName='%s', email='%s'}", id, fullName, email);
    }
}
