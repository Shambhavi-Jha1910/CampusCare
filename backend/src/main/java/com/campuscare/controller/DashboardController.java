package com.campuscare.controller;

import com.campuscare.dto.DashboardSummaryResponse;
import com.campuscare.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboard;

    public DashboardController(DashboardService dashboard) {
        this.dashboard = dashboard;
    }

    @GetMapping("/student/summary")
    @PreAuthorize("hasRole('STUDENT')")
    public DashboardSummaryResponse studentSummary(Authentication authentication) {
        return dashboard.getStudentSummary(authentication.getName());
    }

    @GetMapping("/admin/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public DashboardSummaryResponse adminSummary() {
        return dashboard.getAdminSummary();
    }
}
