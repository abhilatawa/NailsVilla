package com.nailsvilla.gallery;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Development-only: serves images from a local static path rather than cloud storage. */
@Component
public class LocalImageUrlResolver implements ImageUrlResolver {

    private final String baseUrl;

    public LocalImageUrlResolver(@Value("${nailsvilla.images.base-url:/media}") String baseUrl) {
        this.baseUrl = baseUrl;
    }

    @Override
    public String resolve(String storageKey) {
        return baseUrl + "/" + storageKey;
    }
}
