package com.nailsvilla.services;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NailServiceRepository extends JpaRepository<NailService, UUID> {

    List<NailService> findByActiveTrueOrderByDisplayOrderAsc();

    List<NailService> findByActiveTrueAndCategoryIdOrderByDisplayOrderAsc(UUID categoryId);

    Optional<NailService> findByIdAndActiveTrue(UUID id);
}
