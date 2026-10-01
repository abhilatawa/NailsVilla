package com.nailsvilla.appointments;

import static org.assertj.core.api.Assertions.assertThat;

import com.nailsvilla.AbstractIntegrationTest;
import com.nailsvilla.auth.AccessTokenResponse;
import com.nailsvilla.customers.Customer;
import com.nailsvilla.customers.CustomerService;
import com.nailsvilla.services.NailService;
import com.nailsvilla.services.NailServiceRepository;
import com.nailsvilla.users.UserRepository;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

/**
 * Appointments are inserted directly (not through POST /appointments) so their start
 * times can sit a precise number of hours from now — the booking endpoint would reject
 * those for minimum notice or business hours.
 */
class AppointmentLifecycleIntegrationTest extends AbstractIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private NailServiceRepository nailServiceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private AppointmentCompletionJob completionJob;

    @Test
    void customerCanCancelUpToFourHoursBeforeTheAppointment_butNotAfter() {
        String email = "cancel.window+%d@example.com".formatted(System.nanoTime());
        String token = register(email);
        Customer customer = customerService.getOrCreateForUser(userRepository.findByEmailIgnoreCase(email).orElseThrow());

        // Hours apart, and days away from other tests' bookings, so the no-overlap constraint never interferes.
        Appointment insideWindow = insert(customer, Instant.now().plus(Duration.ofHours(3)), AppointmentStatus.CONFIRMED);
        Appointment outsideWindow = insert(customer, Instant.now().plus(Duration.ofHours(9)), AppointmentStatus.CONFIRMED);

        ResponseEntity<String> tooLate = cancel(insideWindow, token);
        assertThat(tooLate.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(tooLate.getBody()).contains("CANCELLATION_WINDOW_CLOSED");
        assertThat(appointmentRepository.findById(insideWindow.getId()).orElseThrow().getStatus())
                .isEqualTo(AppointmentStatus.CONFIRMED);

        ResponseEntity<String> inTime = cancel(outsideWindow, token);
        assertThat(inTime.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(appointmentRepository.findById(outsideWindow.getId()).orElseThrow().getStatus())
                .isEqualTo(AppointmentStatus.CANCELLED);
    }

    @Test
    void completionJobMarksEndedAppointmentsCompletedAndLeavesOthersAlone() {
        String email = "completion+%d@example.com".formatted(System.nanoTime());
        register(email);
        Customer customer = customerService.getOrCreateForUser(userRepository.findByEmailIgnoreCase(email).orElseThrow());

        Instant twoDaysAgo = Instant.now().minus(Duration.ofDays(2)).truncatedTo(ChronoUnit.MINUTES);
        Appointment endedConfirmed = insert(customer, twoDaysAgo, AppointmentStatus.CONFIRMED);
        Appointment endedPending = insert(customer, twoDaysAgo.plus(Duration.ofHours(5)), AppointmentStatus.PENDING);
        Appointment endedCancelled = insert(customer, twoDaysAgo.plus(Duration.ofHours(10)), AppointmentStatus.CANCELLED);
        Appointment upcoming = insert(customer, Instant.now().plus(Duration.ofDays(40)), AppointmentStatus.CONFIRMED);

        completionJob.completePastAppointments();

        assertThat(statusOf(endedConfirmed)).isEqualTo(AppointmentStatus.COMPLETED);
        assertThat(statusOf(endedPending)).isEqualTo(AppointmentStatus.COMPLETED);
        assertThat(statusOf(endedCancelled)).isEqualTo(AppointmentStatus.CANCELLED);
        assertThat(statusOf(upcoming)).isEqualTo(AppointmentStatus.CONFIRMED);
    }

    private Appointment insert(Customer customer, Instant start, AppointmentStatus status) {
        NailService service = nailServiceRepository.findByActiveTrueOrderByDisplayOrderAsc().get(0);
        Appointment appointment = new Appointment();
        appointment.setCustomerId(customer.getId());
        appointment.setServiceId(service.getId());
        appointment.setStartAt(start);
        appointment.setEndAt(start.plus(Duration.ofMinutes(service.getDurationMinutes())));
        appointment.setStatus(status);
        appointment.setPriceMinor(6000);
        appointment.setCurrency("CAD");
        appointment.setCreatedAt(Instant.now());
        appointment.setUpdatedAt(Instant.now());
        return appointmentRepository.saveAndFlush(appointment);
    }

    private AppointmentStatus statusOf(Appointment appointment) {
        return appointmentRepository.findById(appointment.getId()).orElseThrow().getStatus();
    }

    private ResponseEntity<String> cancel(Appointment appointment, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);
        return restTemplate.exchange(url("/api/v1/appointments/" + appointment.getId() + "/cancel"),
                HttpMethod.POST, new HttpEntity<>("{}", headers), String.class);
    }

    private String register(String email) {
        String body = """
                {"firstName":"Riley","lastName":"Customer","email":"%s","password":"a-secure-password"}
                """.formatted(email);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return restTemplate.postForEntity(url("/api/v1/auth/register"), new HttpEntity<>(body, headers), AccessTokenResponse.class)
                .getBody().accessToken();
    }

    private String url(String path) {
        return "http://localhost:" + port + path;
    }
}
