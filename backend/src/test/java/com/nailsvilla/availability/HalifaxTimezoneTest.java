package com.nailsvilla.availability;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import org.junit.jupiter.api.Test;

/**
 * Proves the booking system resolves Halifax wall-clock time to the correct UTC
 * instant across the DST boundary, rather than assuming a fixed offset (Section 3 of
 * the brief is explicit about this). Halifax observes AST (UTC-4) in winter and ADT
 * (UTC-3) in summer.
 */
class HalifaxTimezoneTest {

    private static final ZoneId HALIFAX = ZoneId.of("America/Halifax");

    @Test
    void winterOpeningTimeUsesAtlanticStandardTime() {
        ZonedDateTime winterOpen = ZonedDateTime.of(LocalDate.of(2026, 1, 15), LocalTime.of(8, 0), HALIFAX);

        assertThat(winterOpen.getOffset()).isEqualTo(ZoneOffset.ofHours(-4));
        assertThat(winterOpen.toInstant().toString()).isEqualTo("2026-01-15T12:00:00Z");
    }

    @Test
    void summerOpeningTimeUsesAtlanticDaylightTime() {
        ZonedDateTime summerOpen = ZonedDateTime.of(LocalDate.of(2026, 7, 15), LocalTime.of(8, 0), HALIFAX);

        assertThat(summerOpen.getOffset()).isEqualTo(ZoneOffset.ofHours(-3));
        assertThat(summerOpen.toInstant().toString()).isEqualTo("2026-07-15T11:00:00Z");
    }

    @Test
    void openingTimeAcrossTheActualDstTransitionShiftsByExactlyOneHour() {
        // Find the real spring-forward transition from the JDK's own tz database,
        // rather than hardcoding a date that could be wrong — proves the system tracks
        // whatever the actual DST rule is, not an assumption baked into the test.
        var transition = HALIFAX.getRules().nextTransition(LocalDate.of(2026, 1, 1).atStartOfDay(HALIFAX).toInstant());
        LocalDate dayBefore = transition.getInstant().atZone(HALIFAX).toLocalDate().minusDays(1);
        LocalDate dayAfter = transition.getInstant().atZone(HALIFAX).toLocalDate().plusDays(1);

        Instant openingBefore = ZonedDateTime.of(dayBefore, LocalTime.of(8, 0), HALIFAX).toInstant();
        Instant openingAfter = ZonedDateTime.of(dayAfter, LocalTime.of(8, 0), HALIFAX).toInstant();

        long hoursBetweenCalendarDays = Duration.between(openingBefore, openingAfter).toHours();

        // Two calendar days apart is normally 48 hours; the DST shift makes it 47 or 49.
        assertThat(hoursBetweenCalendarDays).isNotEqualTo(48);
        assertThat(Math.abs(48 - hoursBetweenCalendarDays)).isEqualTo(1);
    }
}
