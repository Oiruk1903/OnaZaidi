package com.onazaidi.destination.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateDestinationRequest(
        @NotBlank @Size(max = 150) String name,
        @Size(max = 150) String region,
        @Size(max = 100) String country,
        String description,
        String coverImageKey,
        @Size(max = 255) String seoTitle,
        String seoDescription
) {}
