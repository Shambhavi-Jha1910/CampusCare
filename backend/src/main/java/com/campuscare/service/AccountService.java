package com.campuscare.service;

import com.campuscare.dto.RegisterRequest;
import com.campuscare.dto.UserResponse;
import com.campuscare.entity.User;
import com.campuscare.entity.UserRole;
import com.campuscare.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class AccountService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    public AccountService(UserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse registerStudent(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new ResponseStatusException(CONFLICT, "An account with this email already exists.");
        }
        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.STUDENT);
        return UserResponse.from(users.save(user));
    }

    @Transactional(readOnly = true)
    public UserResponse getByEmail(String email) {
        return users.findByEmail(email)
                .map(UserResponse::from)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User account was not found."));
    }
}
