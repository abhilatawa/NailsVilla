package com.nailsvilla.settings;

import com.nailsvilla.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    private final BusinessSettingsRepository repository;

    public SettingsService(BusinessSettingsRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public BusinessSettings getSettings() {
        return repository.findFirstByOrderByUpdatedAtAsc()
                .orElseThrow(() -> new ApiException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "SETTINGS_NOT_CONFIGURED",
                        "Business settings have not been configured."));
    }
}
