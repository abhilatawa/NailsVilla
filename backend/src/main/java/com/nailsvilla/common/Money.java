package com.nailsvilla.common;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Money is persisted as integer minor units (e.g. cents) and only ever converted to a
 * decimal amount at the API boundary, via {@link BigDecimal}. Never represent a price
 * as a {@code float}/{@code double} anywhere in this codebase.
 */
public final class Money {

    private static final int MINOR_UNITS_PER_MAJOR = 100;

    private Money() {
    }

    public static BigDecimal toDecimal(int minorUnits) {
        return BigDecimal.valueOf(minorUnits, 2);
    }

    public static int toMinorUnits(BigDecimal decimal) {
        return decimal.setScale(2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(MINOR_UNITS_PER_MAJOR))
                .intValueExact();
    }
}
