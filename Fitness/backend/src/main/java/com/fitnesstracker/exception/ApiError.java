package com.fitnesstracker.exception;

import java.time.LocalDateTime;

/**
 * Standardized API error response payload.
 * Every error returned by the application follows this consistent structure.
 *
 * @author FitTrack Engineering
 */
public final class ApiError {

    private final LocalDateTime timestamp;
    private final int status;
    private final String error;
    private final String message;
    private final String path;

    public ApiError(int status, String error, String message, String path) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }

    public LocalDateTime getTimestamp() { return timestamp; }
    public int getStatus()             { return status; }
    public String getError()           { return error; }
    public String getMessage()         { return message; }
    public String getPath()            { return path; }
}
