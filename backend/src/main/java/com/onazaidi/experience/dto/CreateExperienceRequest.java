package com.onazaidi.experience.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateExperienceRequest(
        @NotBlank @Size(max = 150) String name,
        String description
) {}