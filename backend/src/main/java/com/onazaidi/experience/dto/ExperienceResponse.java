package com.onazaidi.experience.dto;

import java.time.Instant;
import java.util.UUID;

public record ExperienceResponse(
        UUID id,
        String name,
        String slug,
        String description,
        String status,
        Instant createdAt
) {}