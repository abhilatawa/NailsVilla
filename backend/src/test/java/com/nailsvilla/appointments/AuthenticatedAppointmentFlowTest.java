package com.nailsvilla.appointments;

import static org.assertj.core.api.Assertions.assertThat;

import com.nailsvilla.AbstractIntegrationTest;
import com.nailsvilla.auth.AccessTokenResponse;
import com.nailsvilla.services.NailService;
import com.nailsvilla.services.NailServiceRepository;
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

class AuthenticatedAppointmentFlowTest extends AbstractIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private NailServiceRepository nailServiceRepository;

    @Test
    void loggedInCustomerCanBookViewAndCancelTheirOwnAppointment() {
        String email = "logged.in+%d@example.com".formatted(System.nanoTime());
        String registerBody = """
                {"firstName":"Sam","lastName":"Customer","email":"%s","password":"a-secure-password"}
                """.formatted(email);
        ResponseEntity<AccessTokenResponse> registerResponse = restTemplate.postForEntity(
                url("/api/v1/auth/register"), jsonEntity(registerBody, null), AccessTokenResponse.class);
        String accessToken = registerResponse.getBody().accessToken();

        NailService service = nailServiceRepository.findByActiveTrueOrderByDisplayOrderAsc().get(1);
        LocalDate date = LocalDate.now().plusDays(20);
        LocalTime time = LocalTime.of(9, 0);
        String bookingBody = """
                {"serviceId": "%s", "date": "%s", "startTime": "%s"}
                """.formatted(service.getId(), date, time);

        HttpHeaders bookingHeaders = authHeaders(accessToken);
        bookingHeaders.set("Idempotency-Key", UUID.randomUUID().toString());
        ResponseEntity<AppointmentResponse> bookingResponse = restTemplate.exchange(
                url("/api/v1/appointments"), HttpMethod.POST, new HttpEntity<>(bookingBody, bookingHeaders), AppointmentResponse.class);
        assertThat(bookingResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        UUID appointmentId = bookingResponse.getBody().id();

        ResponseEntity<AppointmentResponse[]> myAppointments = restTemplate.exchange(
                url("/api/v1/appointments/my"), HttpMethod.GET, new HttpEntity<>(authHeaders(accessToken)), AppointmentResponse[].class);
        assertThat(myAppointments.getBody()).extracting(AppointmentResponse::id).contains(appointmentId);

        ResponseEntity<AppointmentResponse> getResponse = restTemplate.exchange(
                url("/api/v1/appointments/" + appointmentId), HttpMethod.GET, new HttpEntity<>(authHeaders(accessToken)), AppointmentResponse.class);
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        ResponseEntity<AppointmentResponse> cancelResponse = restTemplate.exchange(
                url("/api/v1/appointments/" + appointmentId + "/cancel"), HttpMethod.POST,
                new HttpEntity<>("{\"reason\":\"Change of plans\"}", authHeaders(accessToken)), AppointmentResponse.class);
        assertThat(cancelResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(cancelResponse.getBody().status()).isEqualTo(AppointmentStatus.CANCELLED);

        // Accessing another user's appointment must 404, not leak existence.
        String otherEmail = "other.user+%d@example.com".formatted(System.nanoTime());
        String otherRegisterBody = """
                {"firstName":"Other","lastName":"User","email":"%s","password":"another-password"}
                """.formatted(otherEmail);
        ResponseEntity<AccessTokenResponse> otherRegisterResponse = restTemplate.postForEntity(
                url("/api/v1/auth/register"), jsonEntity(otherRegisterBody, null), AccessTokenResponse.class);
        String otherAccessToken = otherRegisterResponse.getBody().accessToken();

        ResponseEntity<String> otherAccessAttempt = restTemplate.exchange(
                url("/api/v1/appointments/" + appointmentId), HttpMethod.GET,
                new HttpEntity<>(authHeaders(otherAccessToken)), String.class);
        assertThat(otherAccessAttempt.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    private HttpHeaders authHeaders(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);
        return headers;
    }

    private HttpEntity<String> jsonEntity(String body, String idempotencyKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (idempotencyKey != null) {
            headers.set("Idempotency-Key", idempotencyKey);
        }
        return new HttpEntity<>(body, headers);
    }

    private String url(String path) {
        return "http://localhost:" + port + path;
    }
}
