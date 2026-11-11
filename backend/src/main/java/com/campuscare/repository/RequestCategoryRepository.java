package com.campuscare.repository;

import com.campuscare.entity.RequestCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RequestCategoryRepository extends JpaRepository<RequestCategory, Long> {
    boolean existsByName(String name);

    Optional<RequestCategory> findByName(String name);

    List<RequestCategory> findAllByActiveTrueOrderBySortOrderAsc();
}
