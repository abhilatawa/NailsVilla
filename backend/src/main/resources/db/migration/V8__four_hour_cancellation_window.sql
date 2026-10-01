-- Customers may cancel their own booking up to 4 hours before it starts (was 24).
UPDATE business_settings SET cancellation_window_hours = 4;
