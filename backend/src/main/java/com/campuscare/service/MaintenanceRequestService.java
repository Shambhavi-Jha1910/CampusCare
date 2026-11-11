package com.campuscare.service;

import com.campuscare.dto.AssignmentRequest;
import com.campuscare.dto.CreateRequestRequest;
import com.campuscare.dto.PageResponse;
import com.campuscare.dto.RequestResponse;
import com.campuscare.dto.StatusHistoryResponse;
import com.campuscare.dto.StatusUpdateRequest;
import com.campuscare.entity.MaintenanceRequest;
import com.campuscare.entity.RequestCategory;
import com.campuscare.entity.RequestStatus;
import com.campuscare.entity.RequestStatusHistory;
import com.campuscare.entity.User;
import com.campuscare.entity.UserRole;
import com.campuscare.repository.MaintenanceRequestRepository;
import com.campuscare.repository.RequestCategoryRepository;
import com.campuscare.repository.RequestStatusHistoryRepository;
import com.campuscare.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class MaintenanceRequestService {

    private final MaintenanceRequestRepository requests;
    private final RequestCategoryRepository categories;
    private final RequestStatusHistoryRepository history;
    private final UserRepository users;

    public MaintenanceRequestService(
            MaintenanceRequestRepository requests,
            RequestCategoryRepository categories,
            RequestStatusHistoryRepository history,
            UserRepository users
    ) {
        this.requests = requests;
        this.categories = categories;
        this.history = history;
        this.users = users;
    }

    @Transactional
    public RequestResponse create(String email, CreateRequestRequest input) {
        User student = findUser(email);
        RequestCategory category = categories.findById(input.categoryId())
                .filter(RequestCategory::isActive)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Active request category was not found."));

        MaintenanceRequest request = new MaintenanceRequest();
        request.setTitle(input.title().trim());
        request.setDescription(input.description().trim());
        request.setLocationText(input.location().trim());
        request.setPriority(input.priority());
        request.setStatus(RequestStatus.PENDING);
        request.setStudent(student);
        request.setCategory(category);
        request = requests.save(request);

        RequestStatusHistory initialHistory = new RequestStatusHistory();
        initialHistory.setOldStatus(null);
        initialHistory.setNewStatus(RequestStatus.PENDING);
        initialHistory.setNote("Request submitted");
        initialHistory.setChangedBy(student);
        request.addStatusHistory(initialHistory);
        requests.save(request);
        return RequestResponse.from(request);
    }

    @Transactional(readOnly = true)
    public PageResponse<RequestResponse> listMine(
            String email, RequestStatus status, Long categoryId, String query, int page, int size
    ) {
        Long studentId = findUser(email).getId();
        Page<MaintenanceRequest> result = requests.searchStudentRequests(
                studentId, status, categoryId, normalizeQuery(query), pageRequest(page, size)
        );
        return PageResponse.from(result, RequestResponse::from);
    }

    @Transactional(readOnly = true)
    public PageResponse<RequestResponse> listAll(
            RequestStatus status, Long categoryId, String query, int page, int size
    ) {
        Page<MaintenanceRequest> result = requests.searchAllRequests(
                status, categoryId, normalizeQuery(query), pageRequest(page, size)
        );
        return PageResponse.from(result, RequestResponse::from);
    }

    @Transactional(readOnly = true)
    public List<RequestResponse> recent(
            String email, boolean admin, int limit
    ) {
        if (limit < 1 || limit > 50) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Limit must be between 1 and 50."
            );
        }
        Page<MaintenanceRequest> result = admin
                ? requests.searchAllRequests(null, null, null, pageRequest(0, limit))
                : requests.searchStudentRequests(
                        findUser(email).getId(), null, null, null, pageRequest(0, limit)
                );
        return result.getContent().stream().map(RequestResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public RequestResponse get(String publicId, String email, boolean admin) {
        MaintenanceRequest request = findRequest(publicId);
        verifyOwnerOrAdmin(request, email, admin);
        return RequestResponse.from(request);
    }

    @Transactional(readOnly = true)
    public List<StatusHistoryResponse> getHistory(String publicId, String email, boolean admin) {
        MaintenanceRequest request = findRequest(publicId);
        verifyOwnerOrAdmin(request, email, admin);
        return history.findAllByRequestPublicIdOrderByChangedAtAsc(publicId)
                .stream().map(StatusHistoryResponse::from).toList();
    }

    @Transactional
    public RequestResponse updateStatus(String publicId, String adminEmail, StatusUpdateRequest input) {
        MaintenanceRequest request = findRequest(publicId);
        User admin = findUser(adminEmail);
        RequestStatus previousStatus = request.getStatus();

        if (previousStatus != input.status()) {
            request.setStatus(input.status());
            RequestStatusHistory entry = new RequestStatusHistory();
            entry.setOldStatus(previousStatus);
            entry.setNewStatus(input.status());
            entry.setNote(input.note());
            entry.setChangedBy(admin);
            request.addStatusHistory(entry);
            requests.save(request);
        }
        return RequestResponse.from(request);
    }

    @Transactional
    public RequestResponse assign(String publicId, AssignmentRequest input) {
        MaintenanceRequest request = findRequest(publicId);
        User admin = users.findById(input.adminUserId())
                .filter(User::isActive)
                .filter(user -> user.getRole() == UserRole.ADMIN)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Active admin account was not found."));
        request.setAssignedAdmin(admin);
        return RequestResponse.from(requests.save(request));
    }

    @Transactional
    public void softDelete(String publicId) {
        MaintenanceRequest request = findRequest(publicId);
        request.setDeletedAt(Instant.now());
        requests.save(request);
    }

    private User findUser(String email) {
        return users.findByEmail(email)
                .filter(User::isActive)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User account was not found."));
    }

    private MaintenanceRequest findRequest(String publicId) {
        return requests.findByPublicIdAndDeletedAtIsNull(publicId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Maintenance request was not found."));
    }

    private void verifyOwnerOrAdmin(MaintenanceRequest request, String email, boolean admin) {
        if (!admin && !request.getStudent().getEmail().equals(email)) {
            throw new ResponseStatusException(FORBIDDEN, "You cannot access another student's request.");
        }
    }

    private PageRequest pageRequest(int page, int size) {
        if (page < 0 || size < 1 || size > 100) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Page must be non-negative and size must be between 1 and 100."
            );
        }
        return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"));
    }

    private String normalizeQuery(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }
        return query.trim();
    }
}
