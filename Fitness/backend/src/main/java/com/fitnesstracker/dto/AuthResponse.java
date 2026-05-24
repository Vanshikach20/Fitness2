package com.fitnesstracker.dto;

/**
 * Authentication response returned after successful login or registration.
 * Contains the JWT token and basic user information.
 *
 * @author FitTrack Engineering
 */
public class AuthResponse {

    private String token;
    private String fullName;
    private String email;

    public AuthResponse() {}

    public AuthResponse(String token, String fullName, String email) {
        this.token = token;
        this.fullName = fullName;
        this.email = email;
    }

    /* ---------- Getters & Setters ---------- */

    public String getToken()                 { return token; }
    public void setToken(String token)       { this.token = token; }

    public String getFullName()              { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail()                 { return email; }
    public void setEmail(String email)       { this.email = email; }
}
