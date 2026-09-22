package com.nailsvilla.availability;

import java.time.LocalTime;

public record EffectiveHours(boolean closed, LocalTime openTime, LocalTime closeTime) {

    public static EffectiveHours closedDay() {
        return new EffectiveHours(true, null, null);
    }
}
