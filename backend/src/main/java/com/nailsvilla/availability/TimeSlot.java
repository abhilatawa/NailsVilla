package com.nailsvilla.availability;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalTime;

/**
 * A bookable window for one service on one day. {@code available} is false when the
 * window is already taken by another appointment or blocked time — such slots are still
 * returned so the booking page can show them greyed out rather than silently missing.
 */
public record TimeSlot(
        @JsonFormat(pattern = "HH:mm") LocalTime start,
        @JsonFormat(pattern = "HH:mm") LocalTime end,
        boolean available
) {
}
