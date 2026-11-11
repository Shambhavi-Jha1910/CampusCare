package com.campuscare.dto;

public record DashboardSummaryResponse(
        long total,
        long pending,
        long inProgress,
        long resolved
) {
}
