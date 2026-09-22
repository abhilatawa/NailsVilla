package com.nailsvilla.gallery;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GalleryController {

    private final GalleryImageRepository repository;
    private final ImageUrlResolver imageUrlResolver;

    public GalleryController(GalleryImageRepository repository, ImageUrlResolver imageUrlResolver) {
        this.repository = repository;
        this.imageUrlResolver = imageUrlResolver;
    }

    @GetMapping("/api/v1/gallery")
    public List<GalleryImageResponse> listImages(@RequestParam(required = false) String category) {
        List<GalleryImage> images = category != null
                ? repository.findByActiveTrueAndCategoryOrderByDisplayOrderAsc(category)
                : repository.findByActiveTrueOrderByDisplayOrderAsc();
        return images.stream().map(image -> GalleryImageResponse.from(image, imageUrlResolver)).toList();
    }
}
