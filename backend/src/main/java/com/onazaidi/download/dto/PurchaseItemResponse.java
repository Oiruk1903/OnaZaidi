package com.onazaidi.download.dto;

import java.time.Instant;
import java.util.UUID;

public record PurchaseItemResponse(
        UUID entitlementId,
        UUID photoId,
        String photoTitle,
        String photoSlug,
        String thumbnailUrl,
        String status,
        int downloadCount,
        int maxDownloads,
        boolean downloadable,
        Instant purchasedAt,
        Instant lastDownloadedAt
) {}
