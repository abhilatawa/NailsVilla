package com.nailsvilla.gallery;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * {@code storageKey} is an opaque reference into the configured image store (local
 * filesystem in development; S3/R2/Cloudinary in production — see {@link ImageUrlResolver}),
 * never a raw blob in the database (Section 47 of the brief).
 */
@Entity
@Table(name = "gallery_images")
@Getter
@Setter
@NoArgsConstructor
public class GalleryImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "storage_key", nullable = false)
    private String storageKey;

    private String category;

    @Column(name = "alt_text", nullable = false)
    private String altText;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
