package com.onazaidi.download.entity;

import com.onazaidi.order.entity.OrderItem;
import com.onazaidi.photo.entity.Photo;
import com.onazaidi.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "download_entitlements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DownloadEntitlement {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "photo_id", nullable = false)
    private Photo photo;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "download_count", nullable = false)
    @Builder.Default
    private Integer downloadCount = 0;

    @Column(name = "max_downloads", nullable = false)
    @Builder.Default
    private Integer maxDownloads = 10;

    @Column(name = "last_downloaded_at")
    private Instant lastDownloadedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public boolean isActive() {
        return "ACTIVE".equals(status);
    }

    public boolean canDownload() {
        return isActive() && downloadCount < maxDownloads;
    }
}
