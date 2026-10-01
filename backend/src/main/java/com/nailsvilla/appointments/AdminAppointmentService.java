package com.nailsvilla.appointments;

import com.nailsvilla.common.ApiException;
import com.nailsvilla.common.Money;
import com.nailsvilla.customers.Customer;
import com.nailsvilla.customers.CustomerRepository;
import com.nailsvilla.services.NailService;
import com.nailsvilla.services.NailServiceRepository;
import com.nailsvilla.settings.SettingsService;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Read-only view of every customer's bookings for the admin panel. */
@Service
public class AdminAppointmentService {

    private static final long MAX_RANGE_DAYS = 366;

    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final NailServiceRepository serviceRepository;
    private final SettingsService settingsService;

    public AdminAppointmentService(
            AppointmentRepository appointmentRepository,
            CustomerRepository customerRepository,
            NailServiceRepository serviceRepository,
            SettingsService settingsService
    ) {
        this.appointmentRepository = appointmentRepository;
        this.customerRepository = customerRepository;
        this.serviceRepository = serviceRepository;
        this.settingsService = settingsService;
    }

    /** Appointments starting on any salon-local day in [from, to], inclusive, earliest first. */
    @Transactional(readOnly = true)
    public List<AdminAppointmentResponse> listAppointments(LocalDate from, LocalDate to, AppointmentStatus status) {
        if (to.isBefore(from)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_DATE_RANGE", "The end date must be on or after the start date.");
        }
        if (ChronoUnit.DAYS.between(from, to) > MAX_RANGE_DAYS) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_DATE_RANGE", "Please choose a range of one year or less.");
        }

        ZoneId zone = ZoneId.of(settingsService.getSettings().getTimezone());
        ZonedDateTime rangeStart = from.atStartOfDay(zone);
        ZonedDateTime rangeEnd = to.plusDays(1).atStartOfDay(zone);

        List<Appointment> appointments = status == null
                ? appointmentRepository.findByStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(
                        rangeStart.toInstant(), rangeEnd.toInstant())
                : appointmentRepository.findByStatusAndStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(
                        status, rangeStart.toInstant(), rangeEnd.toInstant());

        Map<UUID, Customer> customers = customerRepository
                .findAllById(appointments.stream().map(Appointment::getCustomerId).distinct().toList()).stream()
                .collect(Collectors.toMap(Customer::getId, Function.identity()));
        Map<UUID, NailService> services = serviceRepository
                .findAllById(appointments.stream().map(Appointment::getServiceId).distinct().toList()).stream()
                .collect(Collectors.toMap(NailService::getId, Function.identity()));

        return appointments.stream()
                .map(appointment -> toResponse(appointment, customers.get(appointment.getCustomerId()),
                        services.get(appointment.getServiceId()), zone))
                .toList();
    }

    private AdminAppointmentResponse toResponse(Appointment appointment, Customer customer, NailService service, ZoneId zone) {
        ZonedDateTime start = appointment.getStartAt().atZone(zone);
        ZonedDateTime end = appointment.getEndAt().atZone(zone);
        return new AdminAppointmentResponse(
                appointment.getId(),
                start.toLocalDate(),
                start.toLocalTime(),
                end.toLocalTime(),
                appointment.getServiceId(),
                service != null ? service.getName() : "Unknown service",
                service != null ? service.getDurationMinutes() : (int) ChronoUnit.MINUTES.between(start, end),
                Money.toDecimal(appointment.getPriceMinor()),
                appointment.getCurrency(),
                appointment.getStatus(),
                customer != null ? customer.getFirstName() + " " + customer.getLastName() : "Unknown customer",
                customer != null ? customer.getEmail() : null,
                customer != null ? customer.getPhone() : null,
                customer == null || customer.getUserId() == null,
                appointment.getCustomerNotes(),
                appointment.getCancellationReason(),
                appointment.getCreatedAt()
        );
    }
}
