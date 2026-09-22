-- Structural double-booking protection: PostgreSQL refuses to commit two active
-- appointments whose [start_at, end_at) ranges overlap, regardless of what the
-- application layer already checked. This is the authoritative guarantee; the
-- service-layer overlap check is a fast-path/UX optimization on top of it.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE appointments
    ADD CONSTRAINT appointments_no_overlap
    EXCLUDE USING gist (
        tstzrange(start_at, end_at, '[)') WITH &&
    )
    WHERE (status IN ('PENDING', 'CONFIRMED'));
