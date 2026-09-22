package com.nailsvilla.gallery;

import java.util.UUID;

public record GalleryImageResponse(UUID id, String url, String category, String altText) {

    static GalleryImageResponse from(GalleryImage image, ImageUrlResolver resolver) {
        return new GalleryImageResponse(image.getId(), resolver.resolve(image.getStorageKey()), image.getCategory(), image.getAltText());
    }
}
