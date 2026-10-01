package com.onazaidi.order.event;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderCreatedEvent(
        UUID orderId,
        String orderNumber,
        String customerEmail,
        BigDecimal totalAmount,
        String currency
) {}

