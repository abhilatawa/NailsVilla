package com.nailsvilla.services;

import java.util.UUID;

public record ServiceCategoryResponse(
        UUID id,
        String name,
        String description,
        int displayOrder
) {
    static ServiceCategoryResponse from(ServiceCategory category) {
        return new ServiceCategoryResponse(category.getId(), category.getName(), category.getDescription(), category.getDisplayOrder());
    }
}
