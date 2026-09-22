package com.nailsvilla.appointments;

import static org.assertj.core.api.Assertions.assertThat;

import com.nailsvilla.AbstractIntegrationTest;
import com.nailsvilla.services.NailService;
import com.nailsvilla.services.NailServiceRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
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
 * Mandatory concurrency test (Sections 17 and 54 of the brief): two customers attempt
 * to book the exact same slot at the same time. Exactly one must succeed and the other
 * must receive 409, with only one appointment ever persisted for that slot.
 */
class AppointmentBookingConcurrencyTest extends AbstractIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private NailServiceRepository nailServiceRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Test
    void twoSimultaneousBookingsForTheSameSlotResultInExactlyOneSuccess() throws Exception {
        NailService service = nailServiceRepository.findAll().stream()
                .filter(NailService::isActive)
                .findFirst()
                .orElseThrow();

        LocalDate targetDate = LocalDate.now().plusDays(10);
        String requestBodyTemplate = """
                {
                  "serviceId": "%s",
                  "date": "%s",
                  "startTime": "10:00",
                  "guestFirstName": "%s",
                  "guestLastName": "Test",
                  "guestEmail": "%s@example.com",
                  "guestPhone": "902-555-0100"
                }
                """;

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch readyLatch = new CountDownLatch(2);
        CountDownLatch startLatch = new CountDownLatch(1);

        List<Future<ResponseEntity<String>>> futures = List.of(
                executor.submit(() -> bookConcurrently(
                        requestBodyTemplate.formatted(service.getId(), targetDate, "Customer A", "customer-a"),
                        readyLatch, startLatch)),
                executor.submit(() -> bookConcurrently(
                        requestBodyTemplate.formatted(service.getId(), targetDate, "Customer B", "customer-b"),
                        readyLatch, startLatch))
        );

        readyLatch.await(5, TimeUnit.SECONDS);
        startLatch.countDown();

        List<Integer> statusCodes = futures.stream()
                .map(future -> {
                    try {
                        return future.get(30, TimeUnit.SECONDS).getStatusCode().value();
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                })
                .toList();
        executor.shutdown();

        long successCount = statusCodes.stream().filter(status -> status == HttpStatus.CREATED.value()).count();
        long conflictCount = statusCodes.stream().filter(status -> status == HttpStatus.CONFLICT.value()).count();

        assertThat(successCount).as("exactly one booking should succeed").isEqualTo(1);
        assertThat(conflictCount).as("the other booking should be rejected with 409").isEqualTo(1);

        var zone = java.time.ZoneId.of("America/Halifax");
        var slotStart = java.time.ZonedDateTime.of(targetDate, java.time.LocalTime.of(10, 0), zone).toInstant();
        var slotEnd = slotStart.plusSeconds((service.getDurationMinutes() + service.getBufferMinutes()) * 60L);
        var appointmentsForSlot = appointmentRepository.findActiveOverlapping(slotStart, slotEnd, AppointmentStatus.ACTIVE);
        assertThat(appointmentsForSlot).hasSize(1);
    }

    private ResponseEntity<String> bookConcurrently(String body, CountDownLatch readyLatch, CountDownLatch startLatch) throws Exception {
        readyLatch.countDown();
        startLatch.await();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Idempotency-Key", UUID.randomUUID().toString());
        HttpEntity<String> entity = new HttpEntity<>(body, headers);

        return restTemplate.exchange(
                "http://localhost:" + port + "/api/v1/appointments",
                HttpMethod.POST, entity, String.class);
    }
}
