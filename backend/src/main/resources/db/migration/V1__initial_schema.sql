-- Nails Villa initial schema.
-- UUID primary keys, timestamptz for all instants, money as integer minor units (never float).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- users / customers
-- ============================================================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL,
    password_hash   TEXT NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(30),
    role            VARCHAR(20) NOT NULL CHECK (role IN ('CUSTOMER', 'ADMIN')),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at   TIMESTAMPTZ
);

CREATE UNIQUE INDEX users_email_unique_idx ON users (lower(email));

-- A customer profile backs every booking. user_id is NULL for a guest booking
-- (no account created); contact fields are always populated so guest bookings
-- remain fully usable without a linked account.
CREATE TABLE customers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID UNIQUE REFERENCES users (id) ON DELETE SET NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(30) NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX customers_email_idx ON customers (lower(email));

-- ============================================================================
-- service catalog
-- ============================================================================

CREATE TABLE service_categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    display_order   INTEGER NOT NULL DEFAULT 0,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE services (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id             UUID NOT NULL REFERENCES service_categories (id),
    name                    VARCHAR(150) NOT NULL,
    description             TEXT,
    short_description       VARCHAR(280),
    price_type              VARCHAR(20) NOT NULL CHECK (price_type IN ('FIXED', 'STARTING_FROM', 'RANGE')),
    price_minor             INTEGER CHECK (price_minor >= 0),
    starting_price_minor    INTEGER CHECK (starting_price_minor >= 0),
    min_price_minor         INTEGER CHECK (min_price_minor >= 0),
    max_price_minor         INTEGER CHECK (max_price_minor >= 0),
    currency                VARCHAR(3) NOT NULL DEFAULT 'CAD',
    duration_minutes        INTEGER NOT NULL CHECK (duration_minutes > 0),
    buffer_minutes          INTEGER NOT NULL DEFAULT 0 CHECK (buffer_minutes >= 0),
    active                  BOOLEAN NOT NULL DEFAULT TRUE,
    featured                BOOLEAN NOT NULL DEFAULT FALSE,
    display_order           INTEGER NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT services_price_fields_match_type CHECK (
        (price_type = 'FIXED' AND price_minor IS NOT NULL)
        OR (price_type = 'STARTING_FROM' AND starting_price_minor IS NOT NULL)
        OR (price_type = 'RANGE' AND min_price_minor IS NOT NULL AND max_price_minor IS NOT NULL
            AND max_price_minor >= min_price_minor)
    )
);

CREATE INDEX services_category_id_idx ON services (category_id);
CREATE INDEX services_active_idx ON services (active);

-- ============================================================================
-- availability: business hours, special-date overrides, ad-hoc blocked periods
-- ============================================================================

-- day_of_week follows java.time.DayOfWeek.getValue(): 1 = Monday ... 7 = Sunday.
CREATE TABLE business_hours (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week     SMALLINT NOT NULL UNIQUE CHECK (day_of_week BETWEEN 1 AND 7),
    is_closed       BOOLEAN NOT NULL DEFAULT FALSE,
    open_time       TIME,
    close_time      TIME,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT business_hours_times_present CHECK (
        is_closed OR (open_time IS NOT NULL AND close_time IS NOT NULL AND close_time > open_time)
    )
);

-- Overrides a single calendar date (holiday, special hours) without touching the weekly template.
CREATE TABLE special_hours (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date            DATE NOT NULL UNIQUE,
    is_closed       BOOLEAN NOT NULL DEFAULT FALSE,
    open_time       TIME,
    close_time      TIME,
    reason          VARCHAR(200),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT special_hours_times_present CHECK (
        is_closed OR (open_time IS NOT NULL AND close_time IS NOT NULL AND close_time > open_time)
    )
);

-- Ad-hoc closures independent of the weekly template (vacation, a private appointment, etc.).
CREATE TABLE blocked_times (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_at        TIMESTAMPTZ NOT NULL,
    end_at          TIMESTAMPTZ NOT NULL,
    reason          VARCHAR(200),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT blocked_times_valid_range CHECK (end_at > start_at)
);

CREATE INDEX blocked_times_range_idx ON blocked_times (start_at, end_at);

-- ============================================================================
-- appointments
-- ============================================================================

CREATE TABLE appointments (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id             UUID NOT NULL REFERENCES customers (id),
    service_id              UUID NOT NULL REFERENCES services (id),
    start_at                TIMESTAMPTZ NOT NULL,
    end_at                  TIMESTAMPTZ NOT NULL,
    status                  VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                                CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    price_minor             INTEGER NOT NULL CHECK (price_minor >= 0),
    currency                VARCHAR(3) NOT NULL DEFAULT 'CAD',
    customer_notes          TEXT,
    admin_notes             TEXT,
    cancellation_reason     TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT appointments_valid_range CHECK (end_at > start_at)
);

CREATE INDEX appointments_customer_id_idx ON appointments (customer_id);
CREATE INDEX appointments_service_id_idx ON appointments (service_id);
CREATE INDEX appointments_start_at_idx ON appointments (start_at);
CREATE INDEX appointments_status_idx ON appointments (status);

-- Backs the Idempotency-Key header on POST /api/v1/appointments: a repeated request
-- with the same key for the same customer replays the original result instead of
-- re-executing the booking logic.
CREATE TABLE idempotency_keys (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key     UUID NOT NULL,
    customer_id         UUID NOT NULL REFERENCES customers (id),
    appointment_id      UUID REFERENCES appointments (id),
    response_status     INTEGER NOT NULL,
    response_body       TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at          TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX idempotency_keys_key_customer_unique_idx ON idempotency_keys (idempotency_key, customer_id);
CREATE INDEX idempotency_keys_expires_at_idx ON idempotency_keys (expires_at);

-- ============================================================================
-- gallery / reviews / promotions
-- ============================================================================

CREATE TABLE gallery_images (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storage_key     TEXT NOT NULL,
    category        VARCHAR(100),
    alt_text        VARCHAR(255) NOT NULL,
    display_order   INTEGER NOT NULL DEFAULT 0,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX gallery_images_active_category_idx ON gallery_images (active, category);

CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id  UUID NOT NULL UNIQUE REFERENCES appointments (id),
    customer_id     UUID NOT NULL REFERENCES customers (id),
    rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX reviews_status_idx ON reviews (status);
CREATE INDEX reviews_customer_id_idx ON reviews (customer_id);

CREATE TABLE promotions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(150) NOT NULL,
    description     TEXT,
    discount_type   VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    discount_value  INTEGER NOT NULL CHECK (discount_value > 0),
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT promotions_valid_range CHECK (end_date >= start_date)
);

CREATE INDEX promotions_active_dates_idx ON promotions (active, start_date, end_date);

-- ============================================================================
-- business settings (singleton) / notifications
-- ============================================================================

CREATE TABLE business_settings (
    id                                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_name                          VARCHAR(150) NOT NULL DEFAULT 'Nails Villa',
    timezone                            VARCHAR(50) NOT NULL DEFAULT 'America/Halifax',
    currency                            VARCHAR(3) NOT NULL DEFAULT 'CAD',
    city                                VARCHAR(100) NOT NULL DEFAULT 'Halifax',
    province                            VARCHAR(100) NOT NULL DEFAULT 'Nova Scotia',
    country                             VARCHAR(100) NOT NULL DEFAULT 'Canada',
    address_line                        TEXT,
    phone                               VARCHAR(30),
    email                               VARCHAR(255),
    instagram_url                       TEXT,
    facebook_url                        TEXT,
    minimum_booking_notice_minutes      INTEGER NOT NULL DEFAULT 120,
    cancellation_window_hours           INTEGER NOT NULL DEFAULT 24,
    reminder_hours_before               INTEGER NOT NULL DEFAULT 24,
    auto_confirm_appointments           BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at                          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email             VARCHAR(255) NOT NULL,
    type                        VARCHAR(50) NOT NULL,
    channel                     VARCHAR(20) NOT NULL DEFAULT 'EMAIL',
    subject                     VARCHAR(255),
    status                      VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                                    CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    error_message               TEXT,
    related_appointment_id      UUID REFERENCES appointments (id),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at                     TIMESTAMPTZ
);

CREATE INDEX notifications_status_idx ON notifications (status);
