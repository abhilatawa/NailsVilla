package com.nailsvilla;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Shared base for backend integration tests. Uses the Testcontainers "singleton
 * container" pattern — started once in a static initializer rather than managed by
 * the {@code @Testcontainers}/{@code @Container} JUnit extension — because that
 * extension's per-class lifecycle hooks were restarting a fresh container (and losing
 * the previous one's port) for every test class instead of reusing one across the
 * whole suite. The JVM's own shutdown hook stops this container when the test run ends.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public abstract class AbstractIntegrationTest {

    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    static {
        POSTGRES.start();
    }
}
