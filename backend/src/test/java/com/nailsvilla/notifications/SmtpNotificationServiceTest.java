package com.nailsvilla.notifications;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

class SmtpNotificationServiceTest {

    private final JavaMailSender mailSender = mock(JavaMailSender.class);
    private final NotificationRepository notificationRepository = mock(NotificationRepository.class);
    private final Clock clock = Clock.fixed(Instant.parse("2026-10-01T12:00:00Z"), ZoneOffset.UTC);
    private final List<NotificationStatus> savedStatuses = new ArrayList<>();

    @BeforeEach
    void recordSavedStatuses() {
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
            Notification notification = invocation.getArgument(0);
            savedStatuses.add(notification.getStatus());
            return notification;
        });
    }

    private SmtpNotificationService service(String salonEmail) {
        var properties = new NotificationProperties("bookings@example.com", salonEmail, "https://salon.example.com/");
        return new SmtpNotificationService(mailSender, notificationRepository, properties, clock);
    }

    @Test
    void bookingEmailsCustomerAndSalonAndRecordsThemAsSent() {
        service("salon@example.com").notifyAppointmentBooked(appointment("CONFIRMED"));

        ArgumentCaptor<SimpleMailMessage> sent = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, times(2)).send(sent.capture());

        SimpleMailMessage customer = sent.getAllValues().get(0);
        assertThat(customer.getTo()).containsExactly("jane@example.com");
        assertThat(customer.getFrom()).isEqualTo("bookings@example.com");
        assertThat(customer.getReplyTo()).isEqualTo("salon@example.com");
        assertThat(customer.getSubject()).startsWith("Booking confirmed");
        assertThat(customer.getText()).contains("Gel Manicure", "Thursday, October 15, 2026", "2:00 PM", "45.00 CAD");

        SimpleMailMessage salon = sent.getAllValues().get(1);
        assertThat(salon.getTo()).containsExactly("salon@example.com");
        assertThat(salon.getReplyTo()).isEqualTo("jane@example.com");
        assertThat(salon.getText()).contains("Jane Doe", "902-555-0100");

        assertThat(savedStatuses).containsExactly(
                NotificationStatus.PENDING, NotificationStatus.SENT,
                NotificationStatus.PENDING, NotificationStatus.SENT);
    }

    @Test
    void pendingBookingTellsCustomerItAwaitsConfirmation() {
        service("salon@example.com").notifyAppointmentBooked(appointment("PENDING"));

        ArgumentCaptor<SimpleMailMessage> sent = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, times(2)).send(sent.capture());
        assertThat(sent.getAllValues().get(0).getSubject()).startsWith("Booking request received");
    }

    @Test
    void skipsSalonAlertWhenNoSalonEmailConfigured() {
        service("").notifyAppointmentCancelled(appointment("CANCELLED"));

        ArgumentCaptor<SimpleMailMessage> sent = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, times(1)).send(sent.capture());
        assertThat(sent.getValue().getTo()).containsExactly("jane@example.com");
        assertThat(sent.getValue().getReplyTo()).isNull();
    }

    @Test
    void smtpFailureIsRecordedNotThrown() {
        doThrow(new MailSendException("connection refused")).when(mailSender).send(any(SimpleMailMessage.class));

        service("").notifyAppointmentRescheduled(appointment("CONFIRMED"));

        assertThat(savedStatuses).containsExactly(NotificationStatus.PENDING, NotificationStatus.FAILED);
    }

    @Test
    void passwordResetEmailLinksToFrontendWithEncodedToken() {
        service("salon@example.com").sendPasswordResetEmail("jane@example.com", "abc+/=");

        ArgumentCaptor<SimpleMailMessage> sent = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(sent.capture());
        assertThat(sent.getValue().getText()).contains("https://salon.example.com/reset-password?token=abc%2B%2F%3D");
    }

    @Test
    void contactFormIsSkippedWithoutSalonEmail() {
        service(null).notifyContactFormSubmission("Jane", "jane@example.com", "Hello");

        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    private AppointmentNotification appointment(String status) {
        return new AppointmentNotification(
                UUID.randomUUID(), "Nails Villa", "Jane Doe", "jane@example.com", "902-555-0100",
                "Gel Manicure", LocalDate.of(2026, 10, 15), LocalTime.of(14, 0), LocalTime.of(15, 0),
                new BigDecimal("45.00"), "CAD", status, "Halifax, Nova Scotia", null, null);
    }
}
