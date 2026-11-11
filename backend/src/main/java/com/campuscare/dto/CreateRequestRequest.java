package com.campuscare.dto;

import com.campuscare.entity.RequestPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateRequestRequest(
        @NotBlank @Size(max = 100) String title,
        @NotNull Long categoryId,
        @NotBlank @Size(max = 160) String location,
        @NotBlank @Size(min = 15, max = 1000) String description,
        @NotNull RequestPriority priority
) {
}
