package com.onazaidi.photo.service;

import com.onazaidi.photo.dto.PhotoDetailResponse;
import com.onazaidi.photo.dto.PhotoResponse;
import com.onazaidi.photo.entity.Photo;
import com.onazaidi.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PhotoMapper {

    private final StorageService storage;

    public PhotoResponse toSummary(Photo p) {
        return new PhotoResponse(
                p.getId(),
                p.getTitle(),
                p.getSlug(),
                url(p.getThumbnailStorageKey()),
                url(p.getPreviewStorageKey()),
                p.getPrice(),
                p.getCurrency(),
                p.getStatus(),
                p.getAlbum() != null ? p.getAlbum().getId() : null,
                p.getAlbum() != null ? p.getAlbum().getTitle() : null,
                p.getDestination() != null ? p.getDestination().getId() : null,
                p.getDestination() != null ? p.getDestination().getName() : null,
                p.getExperience() != null ? p.getExperience().getId() : null,
                p.getExperience() != null ? p.getExperience().getName() : null,
                p.getCreatedAt()
        );
    }

    public PhotoDetailResponse toDetail(Photo p) {
        return new PhotoDetailResponse(
                p.getId(),
                p.getTitle(),
                p.getSlug(),
                p.getDescription(),
                url(p.getPreviewStorageKey()),
                url(p.getWatermarkStorageKey()),
                p.getMimeType(),
                p.getWidth(),
                p.getHeight(),
                p.getFileSizeBytes(),
                p.getPrice(),
                p.getCurrency(),
                p.getStatus(),
                p.getAlbum() != null ? p.getAlbum().getId() : null,
                p.getAlbum() != null ? p.getAlbum().getTitle() : null,
                p.getDestination() != null ? p.getDestination().getId() : null,
                p.getDestination() != null ? p.getDestination().getName() : null,
                p.getAttraction() != null ? p.getAttraction().getId() : null,
                p.getAttraction() != null ? p.getAttraction().getName() : null,
                p.getExperience() != null ? p.getExperience().getId() : null,
                p.getExperience() != null ? p.getExperience().getName() : null,
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getCapturedAt(),
                p.getCreatedAt()
        );
    }

    private String url(String key) {
        if (key == null) return null;
        return storage.publicUrl(key);
    }
}
