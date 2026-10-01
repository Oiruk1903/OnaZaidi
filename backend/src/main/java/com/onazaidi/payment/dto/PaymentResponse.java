package com.onazaidi.payment.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        String provider,
        String providerPaymentId,
        BigDecimal amount,
        String currency,
        String status,
        Instant paidAt,
        Instant createdAt
) {}