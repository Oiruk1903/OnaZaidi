package com.onazaidi.destination.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "destinations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Destination {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 180)
    private String slug;

    @Column(columnDefinition = "text")
    private String description;

    @Column(length = 150)
    private String region;

    @Column(nullable = false, length = 100)
    @Builder.Default
    private String country = "Tanzania";

    @Column(name = "cover_image_key", columnDefinition = "text")
    private String coverImageKey;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "seo_title", length = 255)
    private String seoTitle;

    @Column(name = "seo_description", columnDefinition = "text")
    private String seoDescription;

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
