package com.nailsvilla.appointments;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/** A booking as the salon owner sees it — includes the customer's contact details. */
public record AdminAppointmentResponse(
        UUID id,
        LocalDate date,
        @JsonFormat(pattern = "HH:mm") LocalTime startTime,
        @JsonFormat(pattern = "HH:mm") LocalTime endTime,
        UUID serviceId,
        String serviceName,
        int durationMinutes,
        BigDecimal price,
        String currency,
        AppointmentStatus status,
        String customerName,
        String customerEmail,
        String customerPhone,
        boolean guest,
        String customerNotes,
        String cancellationReason,
        Instant createdAt
) {
}
