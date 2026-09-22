package com.nailsvilla.gallery;

/**
 * Converts an opaque {@code storageKey} into a URL the frontend can load. Swap the
 * implementation to point at S3/R2/Cloudinary in production without touching any
 * caller (Section 47 of the brief) — see {@link LocalImageUrlResolver} for the
 * development-only default.
 */
public interface ImageUrlResolver {

    String resolve(String storageKey);
}
