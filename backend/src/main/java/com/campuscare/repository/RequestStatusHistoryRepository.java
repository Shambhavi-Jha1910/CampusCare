package com.campuscare.repository;

import com.campuscare.entity.RequestStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequestStatusHistoryRepository extends JpaRepository<RequestStatusHistory, Long> {
    List<RequestStatusHistory> findAllByRequestPublicIdOrderByChangedAtAsc(String publicId);
}
