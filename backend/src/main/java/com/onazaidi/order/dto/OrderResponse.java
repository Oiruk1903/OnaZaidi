package com.onazaidi.order.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        String orderNumber,
        String customerName,
        String customerEmail,
        String status,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal taxAmount,
        BigDecimal totalAmount,
        String currency,
        int itemCount,
        List<OrderItemResponse> items,
        Instant createdAt
) {}