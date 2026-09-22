package com.nailsvilla.settings;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "business_settings")
@Getter
@Setter
@NoArgsConstructor
public class BusinessSettings {

    @Id
    private UUID id;

    @Column(name = "salon_name", nullable = false)
    private String salonName;

    @Column(nullable = false)
    private String timezone;

    @Column(nullable = false)
    private String currency;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String province;

    @Column(nullable = false)
    private String country;

    @Column(name = "address_line")
    private String addressLine;

    private String phone;

    private String email;

    @Column(name = "instagram_url")
    private String instagramUrl;

    @Column(name = "facebook_url")
    private String facebookUrl;

    @Column(name = "minimum_booking_notice_minutes", nullable = false)
    private int minimumBookingNoticeMinutes;

    @Column(name = "cancellation_window_hours", nullable = false)
    private int cancellationWindowHours;

    @Column(name = "reminder_hours_before", nullable = false)
    private int reminderHoursBefore;

    @Column(name = "auto_confirm_appointments", nullable = false)
    private boolean autoConfirmAppointments;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
