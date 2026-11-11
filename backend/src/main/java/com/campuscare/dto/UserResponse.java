package com.campuscare.dto;

import com.campuscare.entity.User;
import com.campuscare.entity.UserRole;

public record UserResponse(Long id, String name, String email, UserRole role) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
