package com.nailsvilla.notifications;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.stereotype.Service;

/**
 * Fallback used when no SMTP credentials are configured (MAIL_USERNAME blank): logs that
 * a notification would have been sent, without actually sending it.
 *
 * <p>This can run in production, so it must never log secrets (reset tokens) or message
 * contents — only that an event happened, with a masked address.
 */
@Service
@ConditionalOnExpression("'${spring.mail.username:}'.isBlank()")
public class LoggingNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(LoggingNotificationService.class);

    @Override
    public void sendPasswordResetEmail(String recipientEmail, String rawResetToken) {
        log.info("Password reset requested for {} (email delivery not configured)", maskEmail(recipientEmail));
    }

    @Override
    public void notifyContactFormSubmission(String senderName, String senderEmail, String message) {
        log.info("Contact form submission received from {} (email delivery not configured)", maskEmail(senderEmail));
    }

    @Override
    public void notifyAppointmentBooked(AppointmentNotification appointment) {
        logAppointment("booked", appointment);
    }

    @Override
    public void notifyAppointmentCancelled(AppointmentNotification appointment) {
        logAppointment("cancelled", appointment);
    }

    @Override
    public void notifyAppointmentRescheduled(AppointmentNotification appointment) {
        logAppointment("rescheduled", appointment);
    }

    private void logAppointment(String event, AppointmentNotification appointment) {
        log.info("Appointment {} {} for {} (email delivery not configured)",
                appointment.appointmentId(), event, maskEmail(appointment.customerEmail()));
    }

    static String maskEmail(String email) {
        if (email == null) {
            return "<none>";
        }
        int at = email.indexOf('@');
        if (at <= 0) {
            return "***";
        }
        return email.charAt(0) + "***" + email.substring(at);
    }
}
