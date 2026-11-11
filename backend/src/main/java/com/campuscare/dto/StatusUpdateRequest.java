package com.campuscare.dto;

import com.campuscare.entity.RequestStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StatusUpdateRequest(
        @NotNull RequestStatus status,
        @Size(max = 500) String note
) {
}
