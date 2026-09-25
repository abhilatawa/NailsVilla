package com.nailsvilla.appointments;

import com.nailsvilla.notifications.NotificationService;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Sends appointment emails only once the change is committed, so a booking that rolls
 * back (e.g. a slot conflict) never emails anyone, and a failed email never rolls back
 * a booking.
 */
@Component
public class AppointmentNotificationListener {

    private final NotificationService notificationService;

    public AppointmentNotificationListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onAppointmentChanged(AppointmentChangedEvent event) {
        switch (event.change()) {
            case BOOKED -> notificationService.notifyAppointmentBooked(event.appointment());
            case CANCELLED -> notificationService.notifyAppointmentCancelled(event.appointment());
            case RESCHEDULED -> notificationService.notifyAppointmentRescheduled(event.appointment());
        }
    }
}
