package com.nailsvilla.appointments;

import static org.assertj.core.api.Assertions.assertThat;

import com.nailsvilla.AbstractIntegrationTest;
import com.nailsvilla.availability.AvailabilityResponse;
import com.nailsvilla.availability.TimeSlot;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

class AppointmentBookingFlowTest extends AbstractIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private NailServiceRepository nailServiceRepository;

    @Test
    void guestCanBookAndTheSlotDisappearsFromAvailability_andRetryingWithSameKeyDoesNotDuplicate() {
        NailService service = nailServiceRepository.findByActiveTrueOrderByDisplayOrderAsc().get(0);
        LocalDate date = LocalDate.now().plusDays(15);

        AvailabilityResponse before = getAvailability(service.getId(), date);
        assertThat(before.slots()).isNotEmpty();
        LocalTime time = before.slots().get(0).start();

        String idempotencyKey = UUID.randomUUID().toString();
        String requestBody = """
                {
                  "serviceId": "%s",
                  "date": "%s",
                  "startTime": "%s",
                  "guestFirstName": "Alex",
                  "guestLastName": "Guest",
                  "guestEmail": "alex.guest@example.com",
                  "guestPhone": "902-555-0101"
                }
                """.formatted(service.getId(), date, time);

        ResponseEntity<AppointmentResponse> first = book(requestBody, idempotencyKey);
        assertThat(first.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        UUID appointmentId = first.getBody().id();

        AvailabilityResponse after = getAvailability(service.getId(), date);
        assertThat(after.slots()).extracting(TimeSlot::start).doesNotContain(time);

        // Retrying with the same Idempotency-Key must replay the same appointment, not create a second one.
        ResponseEntity<AppointmentResponse> retry = book(requestBody, idempotencyKey);
        assertThat(retry.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(retry.getBody().id()).isEqualTo(appointmentId);

        // A genuinely new attempt (different key) for the now-taken slot must be rejected.
        ResponseEntity<String> conflicting = restTemplate.postForEntity(
                url("/api/v1/appointments"), jsonEntity(requestBody, UUID.randomUUID().toString()), String.class);
        assertThat(conflicting.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    private ResponseEntity<AppointmentResponse> book(String body, String idempotencyKey) {
        return restTemplate.postForEntity(url("/api/v1/appointments"), jsonEntity(body, idempotencyKey), AppointmentResponse.class);
    }

    private AvailabilityResponse getAvailability(UUID serviceId, LocalDate date) {
        return restTemplate.getForObject(
                url("/api/v1/availability?date=%s&serviceId=%s".formatted(date, serviceId)), AvailabilityResponse.class);
    }

    private HttpEntity<String> jsonEntity(String body, String idempotencyKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Idempotency-Key", idempotencyKey);
        return new HttpEntity<>(body, headers);
    }

    private String url(String path) {
        return "http://localhost:" + port + path;
    }
}
