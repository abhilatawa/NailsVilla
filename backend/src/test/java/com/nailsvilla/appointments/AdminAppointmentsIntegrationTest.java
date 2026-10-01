package com.nailsvilla.appointments;

import static org.assertj.core.api.Assertions.assertThat;

import com.nailsvilla.AbstractIntegrationTest;
import com.nailsvilla.auth.AccessTokenResponse;
import com.nailsvilla.services.NailService;
import com.nailsvilla.services.NailServiceRepository;
import com.nailsvilla.users.Role;
import com.nailsvilla.users.User;
import com.nailsvilla.users.UserRepository;
import com.nailsvilla.users.UserStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
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
import org.springframework.security.crypto.password.PasswordEncoder;

class AdminAppointmentsIntegrationTest extends AbstractIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private NailServiceRepository nailServiceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void adminSeesCustomerBookingsWithContactDetails_customersAndAnonymousUsersCannot() {
        NailService service = nailServiceRepository.findByActiveTrueOrderByDisplayOrderAsc().get(0);
        LocalDate date = LocalDate.now().plusDays(25);
        String guestEmail = "admin.view+%d@example.com".formatted(System.nanoTime());
        String bookingBody = """
                {"serviceId":"%s","date":"%s","startTime":"%s","guestFirstName":"Jordan","guestLastName":"Guest",
                 "guestEmail":"%s","guestPhone":"902-555-0199","customerNotes":"Almond shape please"}
                """.formatted(service.getId(), date, LocalTime.of(10, 0), guestEmail);
        HttpHeaders bookingHeaders = jsonHeaders();
        bookingHeaders.set("Idempotency-Key", UUID.randomUUID().toString());
        ResponseEntity<AppointmentResponse> booking = restTemplate.postForEntity(
                url("/api/v1/appointments"), new HttpEntity<>(bookingBody, bookingHeaders), AppointmentResponse.class);
        assertThat(booking.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        String adminPath = "/api/v1/admin/appointments?from=%s&to=%s".formatted(date, date);

        ResponseEntity<String> anonymous = restTemplate.getForEntity(url(adminPath), String.class);
        assertThat(anonymous.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(anonymous.getBody()).contains("UNAUTHENTICATED");

        String customerToken = register("customer.only+%d@example.com".formatted(System.nanoTime()));
        ResponseEntity<String> asCustomer = restTemplate.exchange(
                url(adminPath), HttpMethod.GET, new HttpEntity<>(bearer(customerToken)), String.class);
        assertThat(asCustomer.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        String adminToken = createAdminAndLogIn();
        ResponseEntity<AdminAppointmentResponse[]> asAdmin = restTemplate.exchange(
                url(adminPath), HttpMethod.GET, new HttpEntity<>(bearer(adminToken)), AdminAppointmentResponse[].class);
        assertThat(asAdmin.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(asAdmin.getBody())
                .filteredOn(appointment -> appointment.id().equals(booking.getBody().id()))
                .singleElement()
                .satisfies(appointment -> {
                    assertThat(appointment.customerName()).isEqualTo("Jordan Guest");
                    assertThat(appointment.customerEmail()).isEqualTo(guestEmail);
                    assertThat(appointment.customerPhone()).isEqualTo("902-555-0199");
                    assertThat(appointment.guest()).isTrue();
                    assertThat(appointment.serviceName()).isEqualTo(service.getName());
                    assertThat(appointment.date()).isEqualTo(date);
                    assertThat(appointment.startTime()).isEqualTo(LocalTime.of(10, 0));
                    assertThat(appointment.customerNotes()).isEqualTo("Almond shape please");
                });

        ResponseEntity<String> backwardsRange = restTemplate.exchange(
                url("/api/v1/admin/appointments?from=%s&to=%s".formatted(date, date.minusDays(1))),
                HttpMethod.GET, new HttpEntity<>(bearer(adminToken)), String.class);
        assertThat(backwardsRange.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    private String createAdminAndLogIn() {
        String email = "owner+%d@example.com".formatted(System.nanoTime());
        User admin = new User();
        admin.setEmail(email);
        admin.setPasswordHash(passwordEncoder.encode("owner-password"));
        admin.setFirstName("Salon");
        admin.setLastName("Owner");
        admin.setRole(Role.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
        admin.setCreatedAt(Instant.now());
        admin.setUpdatedAt(Instant.now());
        userRepository.save(admin);

        String body = """
                {"email":"%s","password":"owner-password"}
                """.formatted(email);
        return restTemplate.postForEntity(url("/api/v1/auth/login"), new HttpEntity<>(body, jsonHeaders()), AccessTokenResponse.class)
                .getBody().accessToken();
    }

    private String register(String email) {
        String body = """
                {"firstName":"Casey","lastName":"Customer","email":"%s","password":"a-secure-password"}
                """.formatted(email);
        return restTemplate.postForEntity(url("/api/v1/auth/register"), new HttpEntity<>(body, jsonHeaders()), AccessTokenResponse.class)
                .getBody().accessToken();
    }

    private HttpHeaders bearer(String token) {
        HttpHeaders headers = jsonHeaders();
        headers.setBearerAuth(token);
        return headers;
    }

    private HttpHeaders jsonHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    private String url(String path) {
        return "http://localhost:" + port + path;
    }
}
