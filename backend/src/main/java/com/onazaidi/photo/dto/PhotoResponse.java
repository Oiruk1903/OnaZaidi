package com.onazaidi.photo.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PhotoResponse(
        UUID id,
        String title,
        String slug,
        String thumbnailUrl,
        String previewUrl,
        BigDecimal price,
        String currency,
        String status,
        UUID albumId,
        String albumTitle,
        UUID destinationId,
        String destinationName,
        UUID experienceId,
        String experienceName,
        Instant createdAt
) {}