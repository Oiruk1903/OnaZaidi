package com.onazaidi.payment.dto;

import java.math.BigDecimal;

public record PaymentStatusResult(
        String providerPaymentId,
        String status,              // PAID / PENDING / FAILED / ...
        BigDecimal amount,
        String currency,
        String confirmationCode,    // optional reference
        String rawPayload           // optional debug
) {}