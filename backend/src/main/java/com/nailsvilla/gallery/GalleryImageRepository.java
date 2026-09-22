package com.nailsvilla.gallery;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GalleryImageRepository extends JpaRepository<GalleryImage, UUID> {

    List<GalleryImage> findByActiveTrueOrderByDisplayOrderAsc();

    List<GalleryImage> findByActiveTrueAndCategoryOrderByDisplayOrderAsc(String category);
}
