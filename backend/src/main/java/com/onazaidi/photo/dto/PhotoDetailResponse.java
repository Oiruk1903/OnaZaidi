package com.onazaidi.photo.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PhotoDetailResponse(
        UUID id,
        String title,
        String slug,
        String description,
        String previewUrl,
        String watermarkUrl,
        String mimeType,
        Integer width,
        Integer height,
        Long fileSizeBytes,
        BigDecimal price,
        String currency,
        String status,
        UUID albumId,
        String albumTitle,
        UUID destinationId,
        String destinationName,
        UUID attractionId,
        String attractionName,
        UUID experienceId,
        String experienceName,
        UUID categoryId,
        String categoryName,
        Instant capturedAt,
        Instant createdAt
) {}