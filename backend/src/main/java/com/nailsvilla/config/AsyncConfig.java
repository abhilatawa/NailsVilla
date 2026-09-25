package com.nailsvilla.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Enables {@code @Async} so outgoing email is sent on a background thread (Spring Boot's
 * default task executor) instead of making the customer wait on the SMTP server.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
