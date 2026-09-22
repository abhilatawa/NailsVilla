package com.nailsvilla.auth;

/** The refresh token is never included here — it travels only as an httpOnly cookie. */
public record AccessTokenResponse(
        String accessToken,
        long expiresInSeconds,
        AuthUserResponse user
) {
}
