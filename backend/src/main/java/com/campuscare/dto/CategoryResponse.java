package com.campuscare.dto;

import com.campuscare.entity.RequestCategory;

public record CategoryResponse(Long id, String name, int sortOrder) {
    public static CategoryResponse from(RequestCategory category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getSortOrder());
    }
}
