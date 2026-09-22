package com.nailsvilla.services;

import com.nailsvilla.common.ApiException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ServicesQueryService {

    private final NailServiceRepository serviceRepository;
    private final ServiceCategoryRepository categoryRepository;

    public ServicesQueryService(NailServiceRepository serviceRepository, ServiceCategoryRepository categoryRepository) {
        this.serviceRepository = serviceRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> listServices(UUID categoryId) {
        List<NailService> services = categoryId != null
                ? serviceRepository.findByActiveTrueAndCategoryIdOrderByDisplayOrderAsc(categoryId)
                : serviceRepository.findByActiveTrueOrderByDisplayOrderAsc();

        Map<UUID, String> categoryNamesById = categoryRepository.findAll().stream()
                .collect(Collectors.toMap(ServiceCategory::getId, ServiceCategory::getName));

        return services.stream()
                .map(service -> ServiceResponse.from(service, categoryNamesById.get(service.getCategoryId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public ServiceResponse getService(UUID id) {
        NailService service = serviceRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SERVICE_NOT_FOUND", "That service could not be found."));
        String categoryName = categoryRepository.findById(service.getCategoryId())
                .map(ServiceCategory::getName)
                .orElse(null);
        return ServiceResponse.from(service, categoryName);
    }

    @Transactional(readOnly = true)
    public List<ServiceCategoryResponse> listCategories() {
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(ServiceCategoryResponse::from)
                .toList();
    }
}
