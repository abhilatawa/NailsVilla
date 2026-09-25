package com.nailsvilla.notifications;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Stand-in until real email ships: logs that a notification would have been sent,
 * without actually sending it. Swap this out for a real SMTP-backed implementation of
 * {@link NotificationService} when the notifications phase is built.
 *
 * <p>This runs in production, so it must never log secrets (reset tokens) or message
 * contents — only that an event happened, with a masked address.
 */
@Service
public class LoggingNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(LoggingNotificationService.class);

    @Override
    public void sendPasswordResetEmail(String recipientEmail, String rawResetToken) {
        log.info("Password reset requested for {} (email delivery not yet implemented)", maskEmail(recipientEmail));
    }

    @Override
    public void notifyContactFormSubmission(String senderName, String senderEmail, String message) {
        log.info("Contact form submission received from {} (email delivery not yet implemented)", maskEmail(senderEmail));
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
