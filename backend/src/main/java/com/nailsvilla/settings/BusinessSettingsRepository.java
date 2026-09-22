package com.nailsvilla.settings;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessSettingsRepository extends JpaRepository<BusinessSettings, UUID> {

    // business_settings is a singleton table (one seeded row); this avoids assuming a fixed id.
    Optional<BusinessSettings> findFirstByOrderByUpdatedAtAsc();
}
