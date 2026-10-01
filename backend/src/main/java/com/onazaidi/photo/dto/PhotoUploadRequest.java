package com.onazaidi.photo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record PhotoUploadRequest(
        @NotBlank String title,
        String description,
        @NotNull @DecimalMin("0.00") BigDecimal price,
        String currency,
        UUID albumId,
        UUID destinationId,
        UUID attractionId,
        UUID experienceId,
        UUID categoryId
) {}
