-- Initial defaults per the business brief. These are editable via the admin panel,
-- not immutable rules: the owner can close individual days or change hours later.

INSERT INTO business_hours (day_of_week, is_closed, open_time, close_time) VALUES
    (1, FALSE, '08:00', '19:00'), -- Monday
    (2, FALSE, '08:00', '19:00'), -- Tuesday
    (3, FALSE, '08:00', '19:00'), -- Wednesday
    (4, FALSE, '08:00', '19:00'), -- Thursday
    (5, FALSE, '08:00', '19:00'), -- Friday
    (6, FALSE, '08:00', '19:00'), -- Saturday
    (7, FALSE, '08:00', '19:00'); -- Sunday

-- Singleton row. Address/phone/email/social links are intentionally left NULL —
-- placeholders to be filled in by the owner via the admin settings page, never invented.
INSERT INTO business_settings (
    salon_name, timezone, currency, city, province, country,
    minimum_booking_notice_minutes, cancellation_window_hours,
    reminder_hours_before, auto_confirm_appointments
) VALUES (
    'Nails Villa', 'America/Halifax', 'CAD', 'Halifax', 'Nova Scotia', 'Canada',
    120, 24,
    24, TRUE
);
