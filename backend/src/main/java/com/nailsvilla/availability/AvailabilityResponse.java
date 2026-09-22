package com.nailsvilla.availability;

import java.time.LocalDate;
import java.util.List;

public record AvailabilityResponse(LocalDate date, String timezone, List<TimeSlot> slots) {
}
