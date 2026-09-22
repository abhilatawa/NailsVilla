package com.nailsvilla.availability;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalTime;

public record BusinessHoursResponse(
        int dayOfWeek,
        boolean closed,
        @JsonFormat(pattern = "HH:mm") LocalTime openTime,
        @JsonFormat(pattern = "HH:mm") LocalTime closeTime
) {

    static BusinessHoursResponse from(BusinessHours hours) {
        return new BusinessHoursResponse(hours.getDayOfWeek(), hours.isClosed(), hours.getOpenTime(), hours.getCloseTime());
    }
}
