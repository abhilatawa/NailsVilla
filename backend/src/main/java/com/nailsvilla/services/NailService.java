package com.nailsvilla.services;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
 * Maps to the {@code services} table. Named {@code NailService} rather than
 * {@code Service} to avoid colliding with {@link org.springframework.stereotype.Service}
 * wherever both are imported (i.e. in almost every service class in this domain).
 */
@Entity
@Table(name = "services")
@Getter
@Setter
@NoArgsConstructor
public class NailService {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "short_description")
    private String shortDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "price_type", nullable = false)
    private PriceType priceType;

    @Column(name = "price_minor")
    private Integer priceMinor;

    @Column(name = "starting_price_minor")
    private Integer startingPriceMinor;

    @Column(name = "min_price_minor")
    private Integer minPriceMinor;

    @Column(name = "max_price_minor")
    private Integer maxPriceMinor;

    @Column(nullable = false)
    private String currency;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Column(name = "buffer_minutes", nullable = false)
    private int bufferMinutes;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false)
    private boolean featured;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
