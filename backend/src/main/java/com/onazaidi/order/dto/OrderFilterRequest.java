package com.onazaidi.order.dto;

import java.time.Instant;
import java.util.UUID;

public record OrderFilterRequest(
        String search,
        String status,
        UUID customerId,
        Instant from,
        Instant to
) {}