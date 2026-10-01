package com.onazaidi.photo.entity;

import com.onazaidi.album.entity.Album;
import com.onazaidi.category.entity.Category;
import com.onazaidi.destination.entity.Attraction;
import com.onazaidi.destination.entity.Destination;
import com.onazaidi.experience.entity.Experience;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "photos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Photo {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "album_id")
    private Album album;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id")
    private Destination destination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attraction_id")
    private Attraction attraction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experience_id")
    private Experience experience;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, unique = true, length = 280)
    private String slug;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "original_storage_key", nullable = false, columnDefinition = "text")
    private String originalStorageKey;

    @Column(name = "preview_storage_key", columnDefinition = "text")
    private String previewStorageKey;

    @Column(name = "thumbnail_storage_key", columnDefinition = "text")
    private String thumbnailStorageKey;

    @Column(name = "watermark_storage_key", columnDefinition = "text")
    private String watermarkStorageKey;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    private Integer width;
    private Integer height;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 3)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.CHAR)
    private String currency;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "DRAFT";

    @Column(name = "captured_at")
    private Instant capturedAt;

    @Column(name = "created_by", nullable = false, columnDefinition = "uuid")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}