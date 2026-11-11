package com.campuscare.service;

import com.campuscare.dto.DashboardSummaryResponse;
import com.campuscare.entity.RequestStatus;
import com.campuscare.repository.MaintenanceRequestRepository;
import com.campuscare.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class DashboardService {

    private final MaintenanceRequestRepository requests;
    private final UserRepository users;

    public DashboardService(MaintenanceRequestRepository requests, UserRepository users) {
        this.requests = requests;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getStudentSummary(String email) {
        Long studentId = users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User account was not found."))
                .getId();
        return new DashboardSummaryResponse(
                requests.countByStudentIdAndDeletedAtIsNull(studentId),
                requests.countByStudentIdAndStatusAndDeletedAtIsNull(studentId, RequestStatus.PENDING),
                requests.countByStudentIdAndStatusAndDeletedAtIsNull(studentId, RequestStatus.IN_PROGRESS),
                requests.countByStudentIdAndStatusAndDeletedAtIsNull(studentId, RequestStatus.RESOLVED)
        );
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getAdminSummary() {
        return new DashboardSummaryResponse(
                requests.countByDeletedAtIsNull(),
                requests.countByStatusAndDeletedAtIsNull(RequestStatus.PENDING),
                requests.countByStatusAndDeletedAtIsNull(RequestStatus.IN_PROGRESS),
                requests.countByStatusAndDeletedAtIsNull(RequestStatus.RESOLVED)
        );
    }
}
