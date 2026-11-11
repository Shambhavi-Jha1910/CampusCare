package com.campuscare.controller;

import com.campuscare.dto.CategoryResponse;
import com.campuscare.service.CategoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/request-categories")
public class CategoryController {

    private final CategoryService categories;

    public CategoryController(CategoryService categories) {
        this.categories = categories;
    }

    @GetMapping
    public List<CategoryResponse> list() {
        return categories.getActiveCategories();
    }
}
