package com.nailsvilla.availability;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BlockedTimeRepository extends JpaRepository<BlockedTime, UUID> {

    @Query("""
            SELECT b FROM BlockedTime b
            WHERE b.startAt < :rangeEnd AND b.endAt > :rangeStart
            """)
    List<BlockedTime> findOverlapping(@Param("rangeStart") Instant rangeStart, @Param("rangeEnd") Instant rangeEnd);
}
