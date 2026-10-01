package com.onazaidi.experience.dto;

import jakarta.validation.constraints.Size;

public record UpdateExperienceRequest(
        @Size(max = 150) String name,
        String description,
        @Size(max = 30) String status
) {}