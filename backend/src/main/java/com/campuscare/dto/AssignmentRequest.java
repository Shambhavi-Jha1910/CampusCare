package com.campuscare.dto;

import jakarta.validation.constraints.NotNull;

public record AssignmentRequest(@NotNull Long adminUserId) {
}
