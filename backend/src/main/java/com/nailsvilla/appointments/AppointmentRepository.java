package com.nailsvilla.appointments;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    /** Active (PENDING/CONFIRMED) appointments overlapping [rangeStart, rangeEnd). */
    @Query("""
            SELECT a FROM Appointment a
            WHERE a.status IN :statuses
              AND a.startAt < :rangeEnd AND a.endAt > :rangeStart
            """)
    List<Appointment> findActiveOverlapping(
            @Param("rangeStart") Instant rangeStart,
            @Param("rangeEnd") Instant rangeEnd,
            @Param("statuses") List<AppointmentStatus> statuses
    );

    List<Appointment> findByCustomerIdOrderByStartAtDesc(UUID customerId);

    Optional<Appointment> findByIdAndCustomerId(UUID id, UUID customerId);
}
