package com.onazaidi.destination.dto;

import java.time.Instant;
import java.util.UUID;

public record DestinationResponse(
        UUID id,
        String name,
        String slug,
        String description,
        String region,
        String country,
        String coverImageKey,
        String status,
        Instant createdAt
) {}
