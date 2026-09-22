package com.nailsvilla.services;

import com.nailsvilla.common.Money;
import java.math.BigDecimal;
import java.util.UUID;

public record ServiceResponse(
        UUID id,
        UUID categoryId,
        String categoryName,
        String name,
        String description,
        String shortDescription,
        PriceType priceType,
        BigDecimal price,
        BigDecimal startingPrice,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        String currency,
        int durationMinutes,
        boolean featured,
        int displayOrder
) {
    static ServiceResponse from(NailService service, String categoryName) {
        return new ServiceResponse(
                service.getId(),
                service.getCategoryId(),
                categoryName,
                service.getName(),
                service.getDescription(),
                service.getShortDescription(),
                service.getPriceType(),
                toDecimalOrNull(service.getPriceMinor()),
                toDecimalOrNull(service.getStartingPriceMinor()),
                toDecimalOrNull(service.getMinPriceMinor()),
                toDecimalOrNull(service.getMaxPriceMinor()),
                service.getCurrency(),
                service.getDurationMinutes(),
                service.isFeatured(),
                service.getDisplayOrder()
        );
    }

    private static BigDecimal toDecimalOrNull(Integer minorUnits) {
        return minorUnits == null ? null : Money.toDecimal(minorUnits);
    }
}
