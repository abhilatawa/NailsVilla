package com.nailsvilla.notifications;

/**
 * Minimal notification abstraction. The full implementation (Section 37 of the brief —
 * booking/confirmation/cancellation/reminder emails, persisted delivery records, real
 * SMTP) lands in a later phase; this interface exists now so auth flows that must
 * notify a user (password reset) have somewhere real to call, without building ahead
 * of what's needed yet.
 */
public interface NotificationService {

    void sendPasswordResetEmail(String recipientEmail, String rawResetToken);

    void notifyContactFormSubmission(String senderName, String senderEmail, String message);
}
