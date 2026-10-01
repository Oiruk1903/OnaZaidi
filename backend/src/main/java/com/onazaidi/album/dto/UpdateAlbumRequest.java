package com.onazaidi.album.dto;

import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdateAlbumRequest(
        @Size(max = 200) String title,
        String description,
        UUID destinationId,
        UUID experienceId,
        UUID coverPhotoId,
        @Size(max = 30) String status
) {}