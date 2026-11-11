package com.campuscare.dto;

import com.campuscare.entity.RequestStatus;
import com.campuscare.entity.RequestStatusHistory;

import java.time.Instant;

public record StatusHistoryResponse(
        Long id,
        RequestStatus oldStatus,
        RequestStatus newStatus,
        String note,
        Instant changedAt,
        Long changedByUserId,
        String changedBy
) {
    public static StatusHistoryResponse from(RequestStatusHistory history) {
        return new StatusHistoryResponse(
                history.getId(),
                history.getOldStatus(),
                history.getNewStatus(),
                history.getNote(),
                history.getChangedAt(),
                history.getChangedBy().getId(),
                history.getChangedBy().getName()
        );
    }
}
