package com.nailsvilla.notifications;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Development-only stand-in: logs what would be sent instead of actually sending
 * email. Swap this out for a real SMTP-backed implementation of
 * {@link NotificationService} when the notifications phase is built.
 */
@Service
public class LoggingNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(LoggingNotificationService.class);

    @Override
    public void sendPasswordResetEmail(String recipientEmail, String rawResetToken) {
        log.info("[dev] Password reset requested for {}. Reset token: {}", recipientEmail, rawResetToken);
    }

    @Override
    public void notifyContactFormSubmission(String senderName, String senderEmail, String message) {
        log.info("[dev] Contact form submission from {} <{}>: {}", senderName, senderEmail, message);
    }
}
