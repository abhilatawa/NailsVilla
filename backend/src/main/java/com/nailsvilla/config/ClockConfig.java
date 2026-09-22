package com.nailsvilla.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * A single injectable {@link Clock}, so time-dependent logic (booking-notice windows,
 * timestamps) can be deterministically tested rather than calling {@code Instant.now()}
 * directly.
 */
@Configuration
public class ClockConfig {

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
