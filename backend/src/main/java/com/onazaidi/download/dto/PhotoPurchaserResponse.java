package com.onazaidi.download.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PhotoPurchaserResponse(
        UUID customerId,
        String customerName,
        String customerEmail,
        String orderNumber,
        BigDecimal amountPaid,
        String currency,
        Instant purchasedAt
) {}
