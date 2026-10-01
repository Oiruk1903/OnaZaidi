package com.onazaidi.order.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
        UUID id,
        UUID photoId,
        String photoTitle,
        String photoSlug,
        String thumbnailUrl,
        BigDecimal unitPrice,
        Integer quantity,
        BigDecimal subtotal
) {}