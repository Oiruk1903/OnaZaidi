package com.onazaidi.album.dto;

import java.time.Instant;
import java.util.UUID;

public record AlbumResponse(
        UUID id,
        String title,
        String slug,
        String description,
        UUID destinationId,
        String destinationName,
        UUID experienceId,
        String experienceName,
        UUID coverPhotoId,
        String status,
        Instant createdAt
) {}