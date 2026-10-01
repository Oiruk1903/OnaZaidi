package com.onazaidi.user.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminCustomerResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String phone,
        String countryCode,
        String status,
        boolean emailVerified,
        Instant createdAt
) {}
