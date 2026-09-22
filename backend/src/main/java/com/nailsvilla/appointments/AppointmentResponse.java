package com.nailsvilla.appointments;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        UUID serviceId,
        String serviceName,
        LocalDate date,
        @JsonFormat(pattern = "HH:mm") LocalTime startTime,
        @JsonFormat(pattern = "HH:mm") LocalTime endTime,
        int durationMinutes,
        BigDecimal price,
        String currency,
        AppointmentStatus status,
        String businessLocation,
        int cancellationPolicyHours,
        String customerNotes
) {
}
