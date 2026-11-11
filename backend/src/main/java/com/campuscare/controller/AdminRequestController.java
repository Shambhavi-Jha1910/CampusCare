package com.campuscare.controller;

import com.campuscare.dto.AssignmentRequest;
import com.campuscare.dto.PageResponse;
import com.campuscare.dto.RequestResponse;
import com.campuscare.dto.StatusUpdateRequest;
import com.campuscare.entity.RequestStatus;
import com.campuscare.service.MaintenanceRequestService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/admin/requests")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRequestController {

    private final MaintenanceRequestService requests;

    public AdminRequestController(MaintenanceRequestService requests) {
        this.requests = requests;
    }

    @GetMapping
    public PageResponse<RequestResponse> list(
            @RequestParam(required = false) @Size(max = 100) String query,
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) @Positive Long categoryId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size
    ) {
        return requests.listAll(status, categoryId, query, page, size);
    }

    @PatchMapping("/{publicId}/status")
    public RequestResponse updateStatus(
            @PathVariable String publicId,
            Authentication authentication,
            @Valid @RequestBody StatusUpdateRequest input
    ) {
        return requests.updateStatus(publicId, authentication.getName(), input);
    }

    @PatchMapping("/{publicId}/assignment")
    public RequestResponse assign(
            @PathVariable String publicId,
            @Valid @RequestBody AssignmentRequest input
    ) {
        return requests.assign(publicId, input);
    }

    @DeleteMapping("/{publicId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String publicId) {
        requests.softDelete(publicId);
    }
}
