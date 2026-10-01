package com.onazaidi.album.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateAlbumRequest(
        @NotBlank @Size(max = 200) String title,
        String description,
        UUID destinationId,
        UUID experienceId
) {}