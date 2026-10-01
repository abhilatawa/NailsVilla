package com.nailsvilla.appointments;

import com.nailsvilla.settings.SettingsService;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Admin-only (enforced for /api/v1/admin/** in SecurityConfig). */
@RestController
@RequestMapping("/api/v1/admin/appointments")
public class AdminAppointmentController {

    private static final int DEFAULT_RANGE_DAYS = 30;

    private final AdminAppointmentService adminAppointmentService;
    private final SettingsService settingsService;
    private final Clock clock;

    public AdminAppointmentController(AdminAppointmentService adminAppointmentService, SettingsService settingsService, Clock clock) {
        this.adminAppointmentService = adminAppointmentService;
        this.settingsService = settingsService;
        this.clock = clock;
    }

    /** Defaults to today through the next 30 days, in the salon's timezone. */
    @GetMapping
    public List<AdminAppointmentResponse> listAppointments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) AppointmentStatus status
    ) {
        LocalDate today = LocalDate.now(clock.withZone(ZoneId.of(settingsService.getSettings().getTimezone())));
        LocalDate effectiveFrom = from != null ? from : today;
        LocalDate effectiveTo = to != null ? to : effectiveFrom.plusDays(DEFAULT_RANGE_DAYS);
        return adminAppointmentService.listAppointments(effectiveFrom, effectiveTo, status);
    }
}
