package com.nailsvilla.availability;

import java.util.Comparator;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PublicBusinessHoursController {

    private final BusinessHoursRepository repository;

    public PublicBusinessHoursController(BusinessHoursRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/api/v1/business-hours")
    public List<BusinessHoursResponse> getBusinessHours() {
        return repository.findAll().stream()
                .sorted(Comparator.comparingInt(BusinessHours::getDayOfWeek))
                .map(BusinessHoursResponse::from)
                .toList();
    }
}
