package com.campuscare.dto;

import com.campuscare.entity.MaintenanceRequest;
import com.campuscare.entity.RequestPriority;
import com.campuscare.entity.RequestStatus;

import java.time.Instant;

public record RequestResponse(
        String id,
        String title,
        Long categoryId,
        String category,
        String location,
        String description,
        RequestPriority priority,
        RequestStatus status,
        Instant submittedAt,
        Instant updatedAt,
        Instant resolvedAt,
        Long studentId,
        String submittedBy,
        Long assignedAdminId,
        String assignedAdmin
) {
    public static RequestResponse from(MaintenanceRequest request) {
        return new RequestResponse(
                request.getPublicId(),
                request.getTitle(),
                request.getCategory().getId(),
                request.getCategory().getName(),
                request.getLocationText(),
                request.getDescription(),
                request.getPriority(),
                request.getStatus(),
                request.getSubmittedAt(),
                request.getUpdatedAt(),
                request.getResolvedAt(),
                request.getStudent().getId(),
                request.getStudent().getName(),
                request.getAssignedAdmin() == null ? null : request.getAssignedAdmin().getId(),
                request.getAssignedAdmin() == null ? null : request.getAssignedAdmin().getName()
        );
    }
}
