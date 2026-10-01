package com.onazaidi.payment.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentInitRequest(
        UUID orderId,
        String orderNumber,
        BigDecimal amount,
        String currency,
        String customerEmail,
        String customerName,
        String customerPhone,
        String description,
        String callbackUrl,
        String idempotencyKey
) {}