package com.onazaidi.photo.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record PhotoFilterRequest(
        String search,
        UUID albumId,
        UUID destinationId,
        UUID attractionId,
        UUID experienceId,
        UUID categoryId,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        String status,
        String sort
) {}