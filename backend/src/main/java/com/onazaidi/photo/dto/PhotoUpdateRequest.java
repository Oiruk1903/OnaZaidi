package com.onazaidi.photo.dto;

import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record PhotoUpdateRequest(
        @Size(max = 255) String title,
        String description,
        UUID albumId,
        UUID destinationId,
        UUID attractionId,
        UUID experienceId,
        UUID categoryId,
        BigDecimal price,
        @Size(max = 3) String currency,
        @Size(max = 30) String status
) {}