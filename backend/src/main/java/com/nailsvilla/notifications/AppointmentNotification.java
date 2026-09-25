package com.nailsvilla.notifications;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Everything an appointment email needs, captured at the moment of the change so the
 * email can be sent after the transaction commits without touching the database again.
 * Dates and times are already in the salon's timezone.
 */
public record AppointmentNotification(
        UUID appointmentId,
        String salonName,
        String customerName,
        String customerEmail,
        String customerPhone,
        String serviceName,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        BigDecimal price,
        String currency,
        String status,
        String location,
        String customerNotes,
        String cancellationReason
) {
}
