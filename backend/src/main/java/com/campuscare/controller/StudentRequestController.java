package com.campuscare.controller;

import com.campuscare.dto.CreateRequestRequest;
import com.campuscare.dto.PageResponse;
import com.campuscare.dto.RequestResponse;
import com.campuscare.dto.StatusHistoryResponse;
import com.campuscare.entity.RequestStatus;
import com.campuscare.service.MaintenanceRequestService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/v1/requests")
public class StudentRequestController {

    private final MaintenanceRequestService requests;

    public StudentRequestController(MaintenanceRequestService requests) {
        this.requests = requests;
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('STUDENT')")
    public PageResponse<RequestResponse> mine(
            Authentication authentication,
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) @Positive Long categoryId,
            @RequestParam(required = false) @Size(max = 100) String query,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size
    ) {
        return requests.listMine(authentication.getName(), status, categoryId, query, page, size);
    }

    @GetMapping("/recent")
    public List<RequestResponse> recent(
            Authentication authentication,
            @RequestParam(defaultValue = "5") @Positive @Max(50) int limit
    ) {
        return requests.recent(authentication.getName(), isAdmin(authentication), limit);
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @ResponseStatus(HttpStatus.CREATED)
    public RequestResponse create(Authentication authentication, @Valid @RequestBody CreateRequestRequest input) {
        return requests.create(authentication.getName(), input);
    }

    @GetMapping("/{publicId}")
    public RequestResponse get(@PathVariable String publicId, Authentication authentication) {
        return requests.get(publicId, authentication.getName(), isAdmin(authentication));
    }

    @GetMapping("/{publicId}/history")
    public List<StatusHistoryResponse> history(@PathVariable String publicId, Authentication authentication) {
        return requests.getHistory(publicId, authentication.getName(), isAdmin(authentication));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
    }
}
