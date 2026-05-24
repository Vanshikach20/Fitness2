package com.fitnesstracker.exception;

/**
 * Thrown when a business rule or validation constraint is violated.
 *
 * @author FitTrack Engineering
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
