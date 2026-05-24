package com.fitnesstracker.service;

import com.fitnesstracker.dto.AuthResponse;
import com.fitnesstracker.dto.LoginRequest;
import com.fitnesstracker.dto.RegisterRequest;
import com.fitnesstracker.exception.BadRequestException;
import com.fitnesstracker.model.User;
import com.fitnesstracker.repository.UserRepository;
import com.fitnesstracker.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Handles user registration and authentication logic.
 * Passwords are encoded with BCrypt; authentication yields a signed JWT.
 *
 * @author FitTrack Engineering
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Registers a new user.
     *
     * @param request the registration payload
     * @return {@link AuthResponse} with JWT token and user info
     * @throws BadRequestException if the email is already registered
     */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User saved = userRepository.save(user);
        log.info("New user registered: {} (id={})", saved.getEmail(), saved.getId());

        String token = jwtUtil.generateToken(saved.getId(), saved.getEmail(), saved.getFullName());
        return new AuthResponse(token, saved.getFullName(), saved.getEmail());
    }

    /**
     * Authenticates a user with email and password.
     *
     * @param request the login payload
     * @return {@link AuthResponse} with JWT token and user info
     * @throws BadCredentialsException if credentials are invalid
     */
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().trim().toLowerCase(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getFullName());
        log.info("User logged in: {}", user.getEmail());

        return new AuthResponse(token, user.getFullName(), user.getEmail());
    }
}
