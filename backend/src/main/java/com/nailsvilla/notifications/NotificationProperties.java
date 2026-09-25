package com.nailsvilla.notifications;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @param fromAddress      sender shown on outgoing email; must be a sender verified with the SMTP provider
 * @param salonEmail       inbox that receives new-booking / cancellation alerts; blank disables salon alerts
 * @param frontendBaseUrl  public site URL, used to build links (e.g. password reset) inside emails
 */
@ConfigurationProperties(prefix = "nailsvilla.notifications")
public record NotificationProperties(
        String fromAddress,
        String salonEmail,
        String frontendBaseUrl
) {
}
