package com.onazaidi.cart.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CartItemResponse(
        UUID id,
        UUID photoId,
        String photoTitle,
        String photoSlug,
        String thumbnailUrl,
        BigDecimal price,
        String currency
) {}