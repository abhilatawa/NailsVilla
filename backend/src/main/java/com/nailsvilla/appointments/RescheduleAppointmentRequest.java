package com.nailsvilla.appointments;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record RescheduleAppointmentRequest(
        @NotNull LocalDate date,
        @NotNull LocalTime startTime
) {
}
