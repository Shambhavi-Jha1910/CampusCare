package com.campuscare.config;

import com.campuscare.entity.RequestCategory;
import com.campuscare.repository.RequestCategoryRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class CategorySeedData {

    @Bean
    ApplicationRunner seedRequestCategories(RequestCategoryRepository categories) {
        return args -> {
            List<String> initialCategories = List.of(
                    "Electrical",
                    "Plumbing",
                    "Furniture",
                    "Cleanliness",
                    "IT & Networking",
                    "Other"
            );

            for (int index = 0; index < initialCategories.size(); index++) {
                String name = initialCategories.get(index);
                if (!categories.existsByName(name)) {
                    categories.save(new RequestCategory(name, index + 1));
                }
            }
        };
    }
}
