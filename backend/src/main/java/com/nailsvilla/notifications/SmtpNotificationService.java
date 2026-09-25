package com.nailsvilla.notifications;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Sends plain-text email through the configured SMTP provider (Brevo in production).
 * Active only when MAIL_USERNAME is set; see {@link LoggingNotificationService} otherwise.
 *
 * <p>Every method runs {@link Async} so callers never wait on SMTP, and every email is
 * recorded in the {@code notifications} table as PENDING, then SENT or FAILED. Failures
 * are logged and recorded, never thrown.
 */
@Service
@ConditionalOnExpression("!'${spring.mail.username:}'.isBlank()")
public class SmtpNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(SmtpNotificationService.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy", Locale.ENGLISH);
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH);

    private final JavaMailSender mailSender;
    private final NotificationRepository notificationRepository;
    private final NotificationProperties properties;
    private final Clock clock;

    public SmtpNotificationService(
            JavaMailSender mailSender,
            NotificationRepository notificationRepository,
            NotificationProperties properties,
            Clock clock
    ) {
        this.mailSender = mailSender;
        this.notificationRepository = notificationRepository;
        this.properties = properties;
        this.clock = clock;
    }

    @Async
    @Override
    public void sendPasswordResetEmail(String recipientEmail, String rawResetToken) {
        String link = baseUrl() + "/reset-password?token=" + URLEncoder.encode(rawResetToken, StandardCharsets.UTF_8);
        String body = """
                Hi,

                We received a request to reset your password. Use the link below to choose a new one:

                %s

                This link expires in 1 hour. If you didn't ask for this, you can ignore this email.
                """.formatted(link);
        send("PASSWORD_RESET", recipientEmail, null, "Reset your password", body, null);
    }

    @Async
    @Override
    public void notifyContactFormSubmission(String senderName, String senderEmail, String message) {
        if (!hasSalonEmail()) {
            return;
        }
        String body = """
                New message from the website contact form.

                Name:  %s
                Email: %s

                %s
                """.formatted(senderName, senderEmail, message);
        send("CONTACT_FORM", properties.salonEmail(), senderEmail, "New contact form message from " + senderName, body, null);
    }

    @Async
    @Override
    public void notifyAppointmentBooked(AppointmentNotification appointment) {
        boolean confirmed = "CONFIRMED".equals(appointment.status());
        String customerIntro = confirmed
                ? "Your appointment is confirmed. We look forward to seeing you!"
                : "We've received your booking request. We'll email you once it's confirmed.";
        String customerSubject = (confirmed ? "Booking confirmed" : "Booking request received")
                + " – " + appointment.serviceName();
        send("APPOINTMENT_BOOKED", appointment.customerEmail(), salonReplyTo(), customerSubject,
                customerEmail(appointment, customerIntro), appointment.appointmentId());

        if (hasSalonEmail()) {
            send("APPOINTMENT_BOOKED_SALON", properties.salonEmail(), appointment.customerEmail(),
                    "New booking: " + appointment.serviceName() + " on " + shortWhen(appointment),
                    salonEmail(appointment, "A new appointment has been booked (status: " + appointment.status() + ")."),
                    appointment.appointmentId());
        }
    }

    @Async
    @Override
    public void notifyAppointmentCancelled(AppointmentNotification appointment) {
        send("APPOINTMENT_CANCELLED", appointment.customerEmail(), salonReplyTo(),
                "Appointment cancelled – " + appointment.serviceName(),
                customerEmail(appointment, "Your appointment has been cancelled."), appointment.appointmentId());

        if (hasSalonEmail()) {
            send("APPOINTMENT_CANCELLED_SALON", properties.salonEmail(), appointment.customerEmail(),
                    "Cancelled: " + appointment.serviceName() + " on " + shortWhen(appointment),
                    salonEmail(appointment, "An appointment has been cancelled by the customer."),
                    appointment.appointmentId());
        }
    }

    @Async
    @Override
    public void notifyAppointmentRescheduled(AppointmentNotification appointment) {
        send("APPOINTMENT_RESCHEDULED", appointment.customerEmail(), salonReplyTo(),
                "Appointment rescheduled – " + appointment.serviceName(),
                customerEmail(appointment, "Your appointment has been moved to a new time."), appointment.appointmentId());

        if (hasSalonEmail()) {
            send("APPOINTMENT_RESCHEDULED_SALON", properties.salonEmail(), appointment.customerEmail(),
                    "Rescheduled: " + appointment.serviceName() + " to " + shortWhen(appointment),
                    salonEmail(appointment, "An appointment has been rescheduled by the customer. New time below."),
                    appointment.appointmentId());
        }
    }

    private String customerEmail(AppointmentNotification a, String intro) {
        return """
                Hi %s,

                %s

                %s

                If you have any questions, just reply to this email.

                %s
                """.formatted(a.customerName(), intro, details(a), a.salonName());
    }

    private String salonEmail(AppointmentNotification a, String intro) {
        return """
                %s

                Customer: %s
                Email:    %s
                Phone:    %s

                %s
                """.formatted(intro, a.customerName(), a.customerEmail(), a.customerPhone(), details(a));
    }

    private String details(AppointmentNotification a) {
        StringBuilder details = new StringBuilder()
                .append("Service:  ").append(a.serviceName()).append('\n')
                .append("Date:     ").append(a.date().format(DATE_FORMAT)).append('\n')
                .append("Time:     ").append(a.startTime().format(TIME_FORMAT))
                .append(" – ").append(a.endTime().format(TIME_FORMAT)).append('\n')
                .append("Price:    ").append(a.price().toPlainString()).append(' ').append(a.currency()).append('\n')
                .append("Location: ").append(a.location());
        if (a.customerNotes() != null && !a.customerNotes().isBlank()) {
            details.append("\nNotes:    ").append(a.customerNotes());
        }
        if (a.cancellationReason() != null && !a.cancellationReason().isBlank()) {
            details.append("\nReason:   ").append(a.cancellationReason());
        }
        return details.toString();
    }

    private String shortWhen(AppointmentNotification a) {
        return a.date().format(DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH)) + " at " + a.startTime().format(TIME_FORMAT);
    }

    private void send(String type, String to, String replyTo, String subject, String body, UUID appointmentId) {
        Notification record = new Notification();
        record.setRecipientEmail(to);
        record.setType(type);
        record.setChannel("EMAIL");
        record.setSubject(subject);
        record.setStatus(NotificationStatus.PENDING);
        record.setRelatedAppointmentId(appointmentId);
        record.setCreatedAt(clock.instant());

        try {
            record = notificationRepository.save(record);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(properties.fromAddress());
            message.setTo(to);
            if (replyTo != null && !replyTo.isBlank()) {
                message.setReplyTo(replyTo);
            }
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);

            record.setStatus(NotificationStatus.SENT);
            record.setSentAt(clock.instant());
            notificationRepository.save(record);
        } catch (Exception e) {
            log.warn("Failed to send {} email to {}: {}", type, LoggingNotificationService.maskEmail(to), e.getMessage());
            try {
                record.setStatus(NotificationStatus.FAILED);
                record.setErrorMessage(e.getMessage());
                notificationRepository.save(record);
            } catch (Exception recordFailure) {
                log.warn("Failed to record {} email failure: {}", type, recordFailure.getMessage());
            }
        }
    }

    private boolean hasSalonEmail() {
        return properties.salonEmail() != null && !properties.salonEmail().isBlank();
    }

    private String salonReplyTo() {
        return hasSalonEmail() ? properties.salonEmail() : null;
    }

    private String baseUrl() {
        String url = properties.frontendBaseUrl();
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
