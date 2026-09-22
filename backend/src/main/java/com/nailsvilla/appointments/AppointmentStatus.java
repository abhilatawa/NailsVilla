package com.nailsvilla.appointments;

import java.util.List;

public enum AppointmentStatus {
    PENDING,
    CONFIRMED,
    COMPLETED,
    CANCELLED,
    NO_SHOW;

    /** Statuses that hold a slot — mirrors the {@code appointments_no_overlap} DB constraint's WHERE clause. */
    public static final List<AppointmentStatus> ACTIVE = List.of(PENDING, CONFIRMED);
}
