package com.campuscare.service;

import com.campuscare.dto.CategoryResponse;
import com.campuscare.repository.RequestCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final RequestCategoryRepository categories;

    public CategoryService(RequestCategoryRepository categories) {
        this.categories = categories;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        return categories.findAllByActiveTrueOrderBySortOrderAsc().stream()
                .map(CategoryResponse::from)
                .toList();
    }
}
