package com.fitnesstracker.repository;

import com.fitnesstracker.model.User;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Thread-safe in-memory repository for {@link User} entities.
 * Uses {@link ConcurrentHashMap} and atomic ID generation for safety
 * under concurrent access.
 *
 * @author FitTrack Engineering
 */
@Repository
public class UserRepository {

    private final Map<Long, User> store = new ConcurrentHashMap<>();
    private final AtomicLong idSequence = new AtomicLong(1L);

    /**
     * Persists a new user. Assigns a unique ID if not already set.
     *
     * @param user the user to save
     * @return the saved user with ID populated
     */
    public User save(User user) {
        if (user.getId() == null) {
            user.setId(idSequence.getAndIncrement());
        }
        store.put(user.getId(), user);
        return user;
    }

    /**
     * Finds a user by their unique email address.
     *
     * @param email the email to search for (case-insensitive)
     * @return an {@link Optional} containing the user if found
     */
    public Optional<User> findByEmail(String email) {
        return store.values().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email))
                .findFirst();
    }

    /**
     * Finds a user by their unique ID.
     *
     * @param id the user ID
     * @return an {@link Optional} containing the user if found
     */
    public Optional<User> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    /**
     * Checks whether a user with the given email already exists.
     *
     * @param email the email to check
     * @return true if a user with this email exists
     */
    public boolean existsByEmail(String email) {
        return findByEmail(email).isPresent();
    }
}
