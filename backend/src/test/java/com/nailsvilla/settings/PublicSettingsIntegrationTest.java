package com.nailsvilla.settings;

import static org.assertj.core.api.Assertions.assertThat;

import com.nailsvilla.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.ResponseEntity;

/**
 * Proves the full stack wiring — Flyway migrations, JPA, and REST — works against a
 * real PostgreSQL instance, not just that the application context loads.
 */
class PublicSettingsIntegrationTest extends AbstractIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void publicSettingsReflectsFlywaySeedData() {
        ResponseEntity<PublicSettingsResponse> response = restTemplate.getForEntity(
                "http://localhost:" + port + "/api/v1/settings/public", PublicSettingsResponse.class);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        PublicSettingsResponse body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.salonName()).isEqualTo("Nails Villa");
        assertThat(body.timezone()).isEqualTo("America/Halifax");
        assertThat(body.currency()).isEqualTo("CAD");
        assertThat(body.city()).isEqualTo("Halifax");
        assertThat(body.province()).isEqualTo("Nova Scotia");
    }
}
