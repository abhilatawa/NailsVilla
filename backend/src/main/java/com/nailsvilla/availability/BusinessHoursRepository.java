package com.nailsvilla.availability;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessHoursRepository extends JpaRepository<BusinessHours, UUID> {

    Optional<BusinessHours> findByDayOfWeek(int dayOfWeek);
}
