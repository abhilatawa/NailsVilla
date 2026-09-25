package com.nailsvilla.appointments;

import com.nailsvilla.notifications.AppointmentNotification;

/** Published inside the booking transaction; handled only after it commits. */
public record AppointmentChangedEvent(Change change, AppointmentNotification appointment) {

    public enum Change {
        BOOKED,
        CANCELLED,
        RESCHEDULED
    }
}
