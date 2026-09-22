package com.nailsvilla.availability;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpecialHoursRepository extends JpaRepository<SpecialHours, UUID> {

    Optional<SpecialHours> findByDate(LocalDate date);
}
