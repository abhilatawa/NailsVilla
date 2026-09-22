package com.nailsvilla.appointments;

import com.nailsvilla.common.ApiException;
import com.nailsvilla.security.SecurityUser;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(
            @Valid @RequestBody CreateAppointmentRequest request,
            @RequestHeader("Idempotency-Key") String idempotencyKeyHeader,
            @AuthenticationPrincipal SecurityUser principal
    ) {
        UUID idempotencyKey = parseIdempotencyKey(idempotencyKeyHeader);
        UUID authenticatedUserId = principal != null ? principal.getUserId() : null;
        AppointmentResponse response = appointmentService.createAppointment(request, idempotencyKey, authenticatedUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public List<AppointmentResponse> getMyAppointments(@AuthenticationPrincipal SecurityUser principal) {
        return appointmentService.getMyAppointments(principal.getUserId());
    }

    @GetMapping("/{id}")
    public AppointmentResponse getAppointment(@PathVariable UUID id, @AuthenticationPrincipal SecurityUser principal) {
        return appointmentService.getAppointment(id, principal.getUserId());
    }

    @PostMapping("/{id}/cancel")
    public AppointmentResponse cancelAppointment(
            @PathVariable UUID id,
            @RequestBody(required = false) CancelAppointmentRequest request,
            @AuthenticationPrincipal SecurityUser principal
    ) {
        String reason = request != null ? request.reason() : null;
        return appointmentService.cancelAppointment(id, principal.getUserId(), reason);
    }

    @PatchMapping("/{id}")
    public AppointmentResponse rescheduleAppointment(
            @PathVariable UUID id,
            @Valid @RequestBody RescheduleAppointmentRequest request,
            @AuthenticationPrincipal SecurityUser principal
    ) {
        return appointmentService.rescheduleAppointment(id, principal.getUserId(), request.date(), request.startTime());
    }

    private UUID parseIdempotencyKey(String header) {
        try {
            return UUID.fromString(header);
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_IDEMPOTENCY_KEY",
                    "The Idempotency-Key header must be a valid UUID.");
        }
    }
}
