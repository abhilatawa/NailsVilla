package com.nailsvilla.services;

import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ServicesController {

    private final ServicesQueryService servicesQueryService;

    public ServicesController(ServicesQueryService servicesQueryService) {
        this.servicesQueryService = servicesQueryService;
    }

    @GetMapping("/api/v1/services")
    public List<ServiceResponse> listServices(@RequestParam(required = false) UUID categoryId) {
        return servicesQueryService.listServices(categoryId);
    }

    @GetMapping("/api/v1/services/{id}")
    public ServiceResponse getService(@PathVariable UUID id) {
        return servicesQueryService.getService(id);
    }

    @GetMapping("/api/v1/service-categories")
    public List<ServiceCategoryResponse> listCategories() {
        return servicesQueryService.listCategories();
    }
}
