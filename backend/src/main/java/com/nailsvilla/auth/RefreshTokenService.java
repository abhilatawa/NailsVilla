package com.nailsvilla.auth;

import com.nailsvilla.common.ApiException;
import com.nailsvilla.security.SecurityProperties;
import com.nailsvilla.security.TokenHasher;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Refresh tokens are opaque and stored server-side (hashed) so logout can actually
 * revoke them — unlike a stateless JWT, which remains valid until it expires no matter
 * what the server does. Each successful refresh rotates the token: the old one is
 * revoked and a new one issued, limiting the blast radius if a refresh token leaks.
 */
@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repository;
    private final Clock clock;
    private final Duration ttl;

    public RefreshTokenService(RefreshTokenRepository repository, Clock clock, SecurityProperties properties) {
        this.repository = repository;
        this.clock = clock;
        this.ttl = Duration.ofDays(properties.refreshTokenTtlDays());
    }

    @Transactional
    public String issue(UUID userId) {
        String rawToken = TokenHasher.generateRawToken();
        RefreshToken token = new RefreshToken();
        token.setUserId(userId);
        token.setTokenHash(TokenHasher.hash(rawToken));
        Instant now = clock.instant();
        token.setCreatedAt(now);
        token.setExpiresAt(now.plus(ttl));
        repository.save(token);
        return rawToken;
    }

    /** Validates the token, revokes it, and issues a replacement. Returns the owning user id and the new raw token. */
    @Transactional
    public RotationResult validateAndRotate(String rawToken) {
        RefreshToken token = repository.findByTokenHash(TokenHasher.hash(rawToken))
                .orElseThrow(() -> invalidToken());

        Instant now = clock.instant();
        if (token.getRevokedAt() != null || token.getExpiresAt().isBefore(now)) {
            throw invalidToken();
        }

        token.setRevokedAt(now);
        String newRawToken = issue(token.getUserId());
        return new RotationResult(token.getUserId(), newRawToken);
    }

    @Transactional
    public void revoke(String rawToken) {
        repository.findByTokenHash(TokenHasher.hash(rawToken))
                .ifPresent(token -> token.setRevokedAt(clock.instant()));
    }

    private ApiException invalidToken() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "Your session has expired. Please log in again.");
    }

    public record RotationResult(UUID userId, String rawToken) {
    }
}
