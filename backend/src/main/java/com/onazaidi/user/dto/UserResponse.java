package com.onazaidi.user.dto;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String phone,
        String countryCode,
        String status,
        boolean emailVerified,
        Set<String> roles,
        Instant createdAt
) {}