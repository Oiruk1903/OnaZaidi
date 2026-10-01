package com.onazaidi.download.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PurchaseGroupResponse(
        UUID orderId,
        String orderNumber,
        String status,
        BigDecimal totalAmount,
        String currency,
        Instant purchasedAt,
        int itemCount,
        List<PurchaseItemResponse> items
) {}
