package com.onazaidi.order.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OrderSummaryResponse(
        UUID id,
        String orderNumber,
        String status,
        BigDecimal totalAmount,
        String currency,
        int itemCount,
        Instant createdAt
) {}