package com.nailsvilla.appointments;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nailsvilla.availability.EffectiveHours;
import com.nailsvilla.availability.HoursResolver;
import com.nailsvilla.availability.BlockedTimeRepository;
import com.nailsvilla.common.ApiException;
import com.nailsvilla.common.Money;
import com.nailsvilla.customers.Customer;
import com.nailsvilla.customers.CustomerService;
import com.nailsvilla.services.NailService;
import com.nailsvilla.services.NailServiceRepository;
import com.nailsvilla.services.PriceType;
import com.nailsvilla.settings.BusinessSettings;
import com.nailsvilla.settings.SettingsService;
import com.nailsvilla.users.User;
import com.nailsvilla.users.UserRepository;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppointmentService {

    private static final Duration IDEMPOTENCY_TTL = Duration.ofHours(24);

    private final AppointmentRepository appointmentRepository;
    private final NailServiceRepository serviceRepository;
    private final HoursResolver hoursResolver;
    private final BlockedTimeRepository blockedTimeRepository;
    private final CustomerService customerService;
    private final UserRepository userRepository;
    private final SettingsService settingsService;
    private final IdempotencyRecordRepository idempotencyRecordRepository;
    private final ObjectMapper objectMapper;
    private final Clock clock;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            NailServiceRepository serviceRepository,
            HoursResolver hoursResolver,
            BlockedTimeRepository blockedTimeRepository,
            CustomerService customerService,
            UserRepository userRepository,
            SettingsService settingsService,
            IdempotencyRecordRepository idempotencyRecordRepository,
            ObjectMapper objectMapper,
            Clock clock
    ) {
        this.appointmentRepository = appointmentRepository;
        this.serviceRepository = serviceRepository;
        this.hoursResolver = hoursResolver;
        this.blockedTimeRepository = blockedTimeRepository;
        this.customerService = customerService;
        this.userRepository = userRepository;
        this.settingsService = settingsService;
        this.idempotencyRecordRepository = idempotencyRecordRepository;
        this.objectMapper = objectMapper;
        this.clock = clock;
    }

    @Transactional
    public AppointmentResponse createAppointment(CreateAppointmentRequest request, UUID idempotencyKey, UUID authenticatedUserId) {
        Customer customer = resolveCustomer(request, authenticatedUserId);

        var cached = idempotencyRecordRepository.findByIdempotencyKeyAndCustomerId(idempotencyKey, customer.getId());
        if (cached.isPresent() && cached.get().getExpiresAt().isAfter(clock.instant())) {
            return deserialize(cached.get().getResponseBody());
        }

        NailService service = serviceRepository.findByIdAndActiveTrue(request.serviceId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SERVICE_NOT_FOUND", "That service could not be found."));

        BusinessSettings settings = settingsService.getSettings();
        ZoneId zone = ZoneId.of(settings.getTimezone());

        SlotValidationResult slot = validateSlot(request.date(), request.startTime(), service, settings, zone, null);

        Appointment appointment = new Appointment();
        appointment.setCustomerId(customer.getId());
        appointment.setServiceId(service.getId());
        appointment.setStartAt(slot.start());
        appointment.setEndAt(slot.end());
        appointment.setStatus(settings.isAutoConfirmAppointments() ? AppointmentStatus.CONFIRMED : AppointmentStatus.PENDING);
        appointment.setPriceMinor(representativePriceMinor(service));
        appointment.setCurrency(service.getCurrency());
        appointment.setCustomerNotes(request.customerNotes());
        Instant now = clock.instant();
        appointment.setCreatedAt(now);
        appointment.setUpdatedAt(now);

        Appointment saved;
        try {
            saved = appointmentRepository.saveAndFlush(appointment);
        } catch (DataIntegrityViolationException e) {
            throw appointmentUnavailable();
        }

        AppointmentResponse response = toResponse(saved, service, settings);

        IdempotencyRecord record = new IdempotencyRecord();
        record.setIdempotencyKey(idempotencyKey);
        record.setCustomerId(customer.getId());
        record.setAppointmentId(saved.getId());
        record.setResponseStatus(HttpStatus.CREATED.value());
        record.setResponseBody(serialize(response));
        record.setCreatedAt(now);
        record.setExpiresAt(now.plus(IDEMPOTENCY_TTL));
        idempotencyRecordRepository.save(record);

        return response;
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getMyAppointments(UUID userId) {
        Customer customer = customerService.findByUserId(userId).orElse(null);
        if (customer == null) {
            return List.of();
        }
        BusinessSettings settings = settingsService.getSettings();
        return appointmentRepository.findByCustomerIdOrderByStartAtDesc(customer.getId()).stream()
                .map(appointment -> toResponse(appointment, requireService(appointment.getServiceId()), settings))
                .toList();
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointment(UUID appointmentId, UUID userId) {
        Appointment appointment = requireOwnedAppointment(appointmentId, userId);
        return toResponse(appointment, requireService(appointment.getServiceId()), settingsService.getSettings());
    }

    @Transactional
    public AppointmentResponse cancelAppointment(UUID appointmentId, UUID userId, String reason) {
        Appointment appointment = requireOwnedAppointment(appointmentId, userId);
        if (!AppointmentStatus.ACTIVE.contains(appointment.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "APPOINTMENT_NOT_CANCELLABLE",
                    "This appointment can no longer be cancelled.");
        }
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(reason);
        appointment.setUpdatedAt(clock.instant());
        return toResponse(appointment, requireService(appointment.getServiceId()), settingsService.getSettings());
    }

    @Transactional
    public AppointmentResponse rescheduleAppointment(UUID appointmentId, UUID userId, LocalDate newDate, LocalTime newStartTime) {
        Appointment appointment = requireOwnedAppointment(appointmentId, userId);
        if (!AppointmentStatus.ACTIVE.contains(appointment.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "APPOINTMENT_NOT_RESCHEDULABLE",
                    "This appointment can no longer be rescheduled.");
        }

        NailService service = requireService(appointment.getServiceId());
        BusinessSettings settings = settingsService.getSettings();
        ZoneId zone = ZoneId.of(settings.getTimezone());

        SlotValidationResult slot = validateSlot(newDate, newStartTime, service, settings, zone, appointment.getId());

        appointment.setStartAt(slot.start());
        appointment.setEndAt(slot.end());
        appointment.setUpdatedAt(clock.instant());

        try {
            appointmentRepository.saveAndFlush(appointment);
        } catch (DataIntegrityViolationException e) {
            throw appointmentUnavailable();
        }

        return toResponse(appointment, service, settings);
    }

    private Customer resolveCustomer(CreateAppointmentRequest request, UUID authenticatedUserId) {
        if (authenticatedUserId != null) {
            User user = userRepository.findById(authenticatedUserId)
                    .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_SESSION", "Please log in again."));
            return customerService.getOrCreateForUser(user);
        }

        if (isBlank(request.guestFirstName()) || isBlank(request.guestLastName())
                || isBlank(request.guestEmail()) || isBlank(request.guestPhone())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "GUEST_DETAILS_REQUIRED",
                    "First name, last name, email, and phone are required to book without an account.");
        }
        return customerService.getOrCreateGuest(request.guestFirstName(), request.guestLastName(),
                request.guestEmail(), request.guestPhone());
    }

    private Appointment requireOwnedAppointment(UUID appointmentId, UUID userId) {
        Customer customer = customerService.findByUserId(userId)
                .orElseThrow(this::appointmentNotFound);
        return appointmentRepository.findByIdAndCustomerId(appointmentId, customer.getId())
                .orElseThrow(this::appointmentNotFound);
    }

    /**
     * Runs the full guard sequence (Section 16 of the brief): service active, business
     * open, within hours, meets minimum notice, and does not overlap an existing
     * appointment or blocked time. {@code excludeAppointmentId} lets a reschedule
     * re-validate without conflicting with its own current row.
     */
    private SlotValidationResult validateSlot(
            LocalDate date, LocalTime startTime, NailService service,
            BusinessSettings settings, ZoneId zone, UUID excludeAppointmentId
    ) {
        EffectiveHours hours = hoursResolver.resolve(date);
        if (hours.closed()) {
            throw new ApiException(HttpStatus.CONFLICT, "BUSINESS_CLOSED", "The business is closed on that date.");
        }

        int slotLengthMinutes = service.getDurationMinutes() + service.getBufferMinutes();
        ZonedDateTime startZoned = ZonedDateTime.of(date, startTime, zone);
        ZonedDateTime endZoned = startZoned.plusMinutes(slotLengthMinutes);
        Instant start = startZoned.toInstant();
        Instant end = endZoned.toInstant();

        Instant earliestBookable = clock.instant().plusSeconds(settings.getMinimumBookingNoticeMinutes() * 60L);
        if (start.isBefore(earliestBookable)) {
            throw new ApiException(HttpStatus.CONFLICT, "BOOKING_TOO_SOON",
                    "That time is too soon. Please choose a later time.");
        }

        Instant openInstant = ZonedDateTime.of(date, hours.openTime(), zone).toInstant();
        Instant closeInstant = ZonedDateTime.of(date, hours.closeTime(), zone).toInstant();
        if (start.isBefore(openInstant) || end.isAfter(closeInstant)) {
            throw new ApiException(HttpStatus.CONFLICT, "OUTSIDE_BUSINESS_HOURS",
                    "That time falls outside business hours.");
        }

        boolean overlapsAppointment = appointmentRepository.findActiveOverlapping(start, end, AppointmentStatus.ACTIVE).stream()
                .anyMatch(existing -> !existing.getId().equals(excludeAppointmentId));
        boolean overlapsBlocked = !blockedTimeRepository.findOverlapping(start, end).isEmpty();
        if (overlapsAppointment || overlapsBlocked) {
            throw appointmentUnavailable();
        }

        return new SlotValidationResult(start, end);
    }

    private int representativePriceMinor(NailService service) {
        if (service.getPriceType() == PriceType.FIXED) {
            return service.getPriceMinor();
        }
        if (service.getPriceType() == PriceType.STARTING_FROM) {
            return service.getStartingPriceMinor();
        }
        return service.getMinPriceMinor();
    }

    private AppointmentResponse toResponse(Appointment appointment, NailService service, BusinessSettings settings) {
        ZoneId zone = ZoneId.of(settings.getTimezone());
        ZonedDateTime start = appointment.getStartAt().atZone(zone);
        ZonedDateTime end = appointment.getEndAt().atZone(zone);
        String businessLocation = settings.getCity() + ", " + settings.getProvince();

        return new AppointmentResponse(
                appointment.getId(),
                service.getId(),
                service.getName(),
                start.toLocalDate(),
                start.toLocalTime(),
                end.toLocalTime(),
                service.getDurationMinutes(),
                Money.toDecimal(appointment.getPriceMinor()),
                appointment.getCurrency(),
                appointment.getStatus(),
                businessLocation,
                settings.getCancellationWindowHours(),
                appointment.getCustomerNotes()
        );
    }

    private NailService requireService(UUID serviceId) {
        return serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SERVICE_NOT_FOUND", "That service could not be found."));
    }

    private ApiException appointmentNotFound() {
        return new ApiException(HttpStatus.NOT_FOUND, "APPOINTMENT_NOT_FOUND", "That appointment could not be found.");
    }

    private ApiException appointmentUnavailable() {
        return new ApiException(HttpStatus.CONFLICT, "APPOINTMENT_UNAVAILABLE",
                "That time is no longer available. Please select another time.");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String serialize(AppointmentResponse response) {
        try {
            return objectMapper.writeValueAsString(response);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialize appointment response", e);
        }
    }

    private AppointmentResponse deserialize(String json) {
        try {
            return objectMapper.readValue(json, AppointmentResponse.class);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to deserialize cached appointment response", e);
        }
    }

    private record SlotValidationResult(Instant start, Instant end) {
    }
}
