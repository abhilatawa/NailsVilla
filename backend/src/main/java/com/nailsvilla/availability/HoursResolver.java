package com.nailsvilla.availability;

import java.time.LocalDate;
import org.springframework.stereotype.Component;

/**
 * Resolves the hours that actually apply to a given calendar date: a {@link SpecialHours}
 * override takes precedence over the recurring {@link BusinessHours} weekly template.
 */
@Component
public class HoursResolver {

    private final BusinessHoursRepository businessHoursRepository;
    private final SpecialHoursRepository specialHoursRepository;

    public HoursResolver(BusinessHoursRepository businessHoursRepository, SpecialHoursRepository specialHoursRepository) {
        this.businessHoursRepository = businessHoursRepository;
        this.specialHoursRepository = specialHoursRepository;
    }

    public EffectiveHours resolve(LocalDate date) {
        return specialHoursRepository.findByDate(date)
                .map(special -> new EffectiveHours(special.isClosed(), special.getOpenTime(), special.getCloseTime()))
                .orElseGet(() -> businessHoursRepository.findByDayOfWeek(date.getDayOfWeek().getValue())
                        .map(hours -> new EffectiveHours(hours.isClosed(), hours.getOpenTime(), hours.getCloseTime()))
                        .orElseGet(EffectiveHours::closedDay));
    }
}
