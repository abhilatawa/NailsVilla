package com.nailsvilla.reviews;

import java.time.Instant;
import java.util.UUID;

/** Only the reviewer's first name is exposed publicly — never their full contact profile. */
public record ReviewResponse(UUID id, String customerFirstName, int rating, String comment, Instant createdAt) {
}
