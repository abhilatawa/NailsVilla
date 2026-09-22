package com.nailsvilla.appointments;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Guest contact fields ({@code guestFirstName}..{@code guestPhone}) are required only
 * when the request has no authenticated principal — enforced in
 * {@link AppointmentService}, since it depends on runtime auth state rather than the
 * shape of the request alone.
 */
public record CreateAppointmentRequest(
        @NotNull UUID serviceId,
        @NotNull LocalDate date,
        @NotNull LocalTime startTime,
        @Size(max = 1000) String customerNotes,
        String guestFirstName,
        String guestLastName,
        @Email String guestEmail,
        String guestPhone
) {
}
