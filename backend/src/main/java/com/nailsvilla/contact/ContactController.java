package com.nailsvilla.contact;

import com.nailsvilla.notifications.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ContactController {

    private final NotificationService notificationService;

    public ContactController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/api/v1/contact")
    public ResponseEntity<Void> submit(@Valid @RequestBody ContactRequest request) {
        notificationService.notifyContactFormSubmission(request.name(), request.email(), request.message());
        return ResponseEntity.accepted().build();
    }
}
