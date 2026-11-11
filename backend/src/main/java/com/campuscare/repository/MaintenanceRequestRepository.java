package com.campuscare.repository;

import com.campuscare.entity.MaintenanceRequest;
import com.campuscare.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    Optional<MaintenanceRequest> findByPublicIdAndDeletedAtIsNull(String publicId);

    @Query("""
            select request
            from MaintenanceRequest request
            where request.deletedAt is null
              and request.student.id = :studentId
              and (:status is null or request.status = :status)
              and (:categoryId is null or request.category.id = :categoryId)
              and (:query is null or
                   lower(request.publicId) like lower(concat('%', :query, '%')) or
                   lower(request.title) like lower(concat('%', :query, '%')) or
                   lower(request.locationText) like lower(concat('%', :query, '%')) or
                   lower(request.category.name) like lower(concat('%', :query, '%')))
            """)
    Page<MaintenanceRequest> searchStudentRequests(
            @Param("studentId") Long studentId,
            @Param("status") RequestStatus status,
            @Param("categoryId") Long categoryId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select request
            from MaintenanceRequest request
            where request.deletedAt is null
              and (:status is null or request.status = :status)
              and (:categoryId is null or request.category.id = :categoryId)
              and (:query is null or
                   lower(request.publicId) like lower(concat('%', :query, '%')) or
                   lower(request.title) like lower(concat('%', :query, '%')) or
                   lower(request.locationText) like lower(concat('%', :query, '%')) or
                   lower(request.category.name) like lower(concat('%', :query, '%')) or
                   lower(request.student.name) like lower(concat('%', :query, '%')) or
                   lower(request.student.email) like lower(concat('%', :query, '%')))
            """)
    Page<MaintenanceRequest> searchAllRequests(
            @Param("status") RequestStatus status,
            @Param("categoryId") Long categoryId,
            @Param("query") String query,
            Pageable pageable
    );

    long countByStudentIdAndDeletedAtIsNull(Long studentId);

    long countByStudentIdAndStatusAndDeletedAtIsNull(Long studentId, RequestStatus status);

    long countByDeletedAtIsNull();

    long countByStatusAndDeletedAtIsNull(RequestStatus status);
}
