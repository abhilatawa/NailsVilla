package com.nailsvilla.availability;

import com.nailsvilla.appointments.Appointment;
import com.nailsvilla.appointments.AppointmentRepository;
import com.nailsvilla.appointments.AppointmentStatus;
import com.nailsvilla.common.ApiException;
import com.nailsvilla.services.NailService;
import com.nailsvilla.services.NailServiceRepository;
import com.nailsvilla.settings.BusinessSettings;
import com.nailsvilla.settings.SettingsService;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AvailabilityService {

    private final NailServiceRepository serviceRepository;
    private final HoursResolver hoursResolver;
    private final AppointmentRepository appointmentRepository;
    private final BlockedTimeRepository blockedTimeRepository;
    private final SettingsService settingsService;
    private final Clock clock;

    public AvailabilityService(
            NailServiceRepository serviceRepository,
            HoursResolver hoursResolver,
            AppointmentRepository appointmentRepository,
            BlockedTimeRepository blockedTimeRepository,
            SettingsService settingsService,
            Clock clock
    ) {
        this.serviceRepository = serviceRepository;
        this.hoursResolver = hoursResolver;
        this.appointmentRepository = appointmentRepository;
        this.blockedTimeRepository = blockedTimeRepository;
        this.settingsService = settingsService;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public AvailabilityResponse getAvailability(LocalDate date, UUID serviceId) {
        NailService service = serviceRepository.findByIdAndActiveTrue(serviceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SERVICE_NOT_FOUND", "That service could not be found."));

        BusinessSettings settings = settingsService.getSettings();
        ZoneId zone = ZoneId.of(settings.getTimezone());

        EffectiveHours hours = hoursResolver.resolve(date);
        if (hours.closed()) {
            return new AvailabilityResponse(date, zone.getId(), List.of());
        }

        int slotLengthMinutes = service.getDurationMinutes() + service.getBufferMinutes();
        List<TimeSlot> candidates = generateCandidateSlots(hours.openTime(), hours.closeTime(), slotLengthMinutes);

        ZonedDateTime dayStart = date.atStartOfDay(zone);
        ZonedDateTime dayEnd = dayStart.plusDays(1);
        List<Appointment> existingAppointments =
                appointmentRepository.findActiveOverlapping(dayStart.toInstant(), dayEnd.toInstant(), AppointmentStatus.ACTIVE);
        var blockedTimes = blockedTimeRepository.findOverlapping(dayStart.toInstant(), dayEnd.toInstant());

        Instant earliestBookable = clock.instant().plusSeconds(settings.getMinimumBookingNoticeMinutes() * 60L);

        List<TimeSlot> available = new ArrayList<>();
        for (TimeSlot candidate : candidates) {
            Instant candidateStart = ZonedDateTime.of(date, candidate.start(), zone).toInstant();
            Instant candidateEnd = ZonedDateTime.of(date, candidate.end(), zone).toInstant();

            if (candidateStart.isBefore(earliestBookable)) {
                continue;
            }
            if (overlapsAny(candidateStart, candidateEnd, existingAppointments, blockedTimes)) {
                continue;
            }
            available.add(candidate);
        }

        return new AvailabilityResponse(date, zone.getId(), available);
    }

    private List<TimeSlot> generateCandidateSlots(LocalTime open, LocalTime close, int slotLengthMinutes) {
        List<TimeSlot> slots = new ArrayList<>();
        LocalTime cursor = open;
        while (!cursor.plusMinutes(slotLengthMinutes).isAfter(close)) {
            LocalTime slotEnd = cursor.plusMinutes(slotLengthMinutes);
            slots.add(new TimeSlot(cursor, slotEnd));
            cursor = slotEnd;
        }
        return slots;
    }

    private boolean overlapsAny(
            Instant candidateStart,
            Instant candidateEnd,
            List<Appointment> appointments,
            List<com.nailsvilla.availability.BlockedTime> blockedTimes
    ) {
        for (Appointment appointment : appointments) {
            if (intervalsOverlap(candidateStart, candidateEnd, appointment.getStartAt(), appointment.getEndAt())) {
                return true;
            }
        }
        for (var blocked : blockedTimes) {
            if (intervalsOverlap(candidateStart, candidateEnd, blocked.getStartAt(), blocked.getEndAt())) {
                return true;
            }
        }
        return false;
    }

    /** Half-open interval overlap: two ranges conflict when newStart < existingEnd AND newEnd > existingStart. */
    static boolean intervalsOverlap(Instant startA, Instant endA, Instant startB, Instant endB) {
        return startA.isBefore(endB) && endA.isAfter(startB);
    }
}
