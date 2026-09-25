package com.nailsvilla.notifications;

/**
 * Sends customer and salon notifications. {@link SmtpNotificationService} delivers real
 * email when SMTP credentials are configured; {@link LoggingNotificationService} is the
 * fallback that only logs (local development, tests).
 *
 * <p>Implementations must never throw back into the caller — a failed email should not
 * fail a booking or a password reset request.
 */
public interface NotificationService {

    void sendPasswordResetEmail(String recipientEmail, String rawResetToken);

    void notifyContactFormSubmission(String senderName, String senderEmail, String message);

    void notifyAppointmentBooked(AppointmentNotification appointment);

    void notifyAppointmentCancelled(AppointmentNotification appointment);

    void notifyAppointmentRescheduled(AppointmentNotification appointment);
}
