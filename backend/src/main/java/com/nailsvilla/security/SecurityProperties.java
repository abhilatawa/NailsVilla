package com.nailsvilla.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "nailsvilla.security")
public record SecurityProperties(
        String jwtSecret,
        int accessTokenTtlMinutes,
        int refreshTokenTtlDays
) {
}
