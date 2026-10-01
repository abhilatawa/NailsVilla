package com.nailsvilla.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Enables {@code @Scheduled} background jobs, such as marking past appointments completed. */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
