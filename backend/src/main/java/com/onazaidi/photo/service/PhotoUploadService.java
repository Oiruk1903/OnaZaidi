package com.onazaidi.photo.service;

import com.onazaidi.album.repository.AlbumRepository;
import com.onazaidi.category.repository.CategoryRepository;
import com.onazaidi.common.exception.BusinessException;
import com.onazaidi.common.util.SlugUtil;
import com.onazaidi.destination.repository.AttractionRepository;
import com.onazaidi.destination.repository.DestinationRepository;
import com.onazaidi.experience.repository.ExperienceRepository;
import com.onazaidi.photo.dto.PhotoDetailResponse;
import com.onazaidi.photo.dto.PhotoUploadRequest;
import com.onazaidi.photo.entity.Photo;
import com.onazaidi.photo.repository.PhotoRepository;
import com.onazaidi.security.CurrentUser;
import com.onazaidi.storage.StorageKeys;
import com.onazaidi.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PhotoUploadService {

    private final PhotoRepository photoRepository;
    private final AlbumRepository albumRepository;
    private final DestinationRepository destinationRepository;
    private final AttractionRepository attractionRepository;
    private final ExperienceRepository experienceRepository;
    private final CategoryRepository categoryRepository;
    private final StorageService storage;
    private final ImageProcessingService imageProcessor;
    private final ImageMetadataExtractor metadataExtractor;
    private final PhotoMapper photoMapper;

    @Transactional
    public PhotoDetailResponse upload(MultipartFile file, PhotoUploadRequest req) {
        validate(file);

        byte[] originalBytes;
        try {
            originalBytes = file.getBytes();
        } catch (IOException e) {
            throw new BusinessException("UPLOAD_READ_FAILED", "Could not read uploaded file.");
        }

        var info = metadataExtractor.extract(originalBytes);
        BufferedImage source = imageProcessor.read(originalBytes);

        UUID id = UUID.randomUUID();
        String ext = extensionOf(file.getOriginalFilename(), file.getContentType());

        byte[] previewBytes = imageProcessor.resizeLongSide(source, 1600);
        byte[] thumbBytes = imageProcessor.resizeLongSide(source, 400);

        String originalKey = StorageKeys.original(id, ext);
        String previewKey = StorageKeys.preview(id, "jpg");
        String thumbKey = StorageKeys.thumbnail(id, "jpg");

        try {
            storage.put(originalKey, new ByteArrayInputStream(originalBytes),
                    originalBytes.length, file.getContentType());
            storage.put(previewKey, new ByteArrayInputStream(previewBytes),
                    previewBytes.length, "image/jpeg");
            storage.put(thumbKey, new ByteArrayInputStream(thumbBytes),
                    thumbBytes.length, "image/jpeg");
        } catch (Exception e) {
            log.error("Storage upload failed for photo {}", id, e);
            throw new BusinessException("STORAGE_FAILED",
                    "Failed to store image: " + e.getMessage());
        }

        Photo photo = Photo.builder()
                .id(id)
                .title(req.title())
                .slug(uniqueSlug(req.title()))
                .description(req.description())
                .price(req.price() != null ? req.price() : BigDecimal.ZERO)
                .currency(req.currency() != null ? req.currency() : "USD")
                .status("DRAFT")
                .mimeType(file.getContentType())
                .width(info.width())
                .height(info.height())
                .fileSizeBytes(file.getSize())
                .capturedAt(info.capturedAt())
                .createdBy(CurrentUser.id())
                .originalStorageKey(originalKey)
                .previewStorageKey(previewKey)
                .thumbnailStorageKey(thumbKey)
                .album(req.albumId() != null
                        ? albumRepository.findById(req.albumId()).orElse(null) : null)
                .destination(req.destinationId() != null
                        ? destinationRepository.findById(req.destinationId()).orElse(null) : null)
                .attraction(req.attractionId() != null
                        ? attractionRepository.findById(req.attractionId()).orElse(null) : null)
                .experience(req.experienceId() != null
                        ? experienceRepository.findById(req.experienceId()).orElse(null) : null)
                .category(req.categoryId() != null
                        ? categoryRepository.findById(req.categoryId()).orElse(null) : null)
                .build();

        photo = photoRepository.save(photo);

        log.info("Uploaded photo {} ({}x{}, {} bytes)",
                id, info.width(), info.height(), originalBytes.length);

        return photoMapper.toDetail(photo);
    }

    @Transactional
    public PhotoDetailResponse publish(UUID id) {
        Photo photo = photoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Photo not found."));

        try {
            byte[] preview = storage.get(photo.getPreviewStorageKey()).readAllBytes();
            BufferedImage img = imageProcessor.read(preview);
            byte[] watermarked = imageProcessor.watermark(img, "OnaZaidi");

            String wmKey = StorageKeys.watermark(photo.getId(), "jpg");
            storage.put(wmKey, new ByteArrayInputStream(watermarked),
                    watermarked.length, "image/jpeg");

            photo.setWatermarkStorageKey(wmKey);
        } catch (Exception e) {
            log.error("Failed to generate watermark for {}", id, e);
            throw new BusinessException("WATERMARK_FAILED",
                    "Could not generate watermarked preview.");
        }

        photo.setStatus("PUBLISHED");
        photo = photoRepository.save(photo);
        return photoMapper.toDetail(photo);
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("EMPTY_FILE", "No file uploaded.");
        }
        String ct = file.getContentType();
        if (ct == null || !ct.startsWith("image/")) {
            throw new BusinessException("INVALID_TYPE", "Only image uploads are allowed.");
        }
        if (file.getSize() > 50L * 1024 * 1024) {
            throw new BusinessException("FILE_TOO_LARGE", "Max file size is 50 MB.");
        }
    }

    private String uniqueSlug(String title) {
        String base = SlugUtil.slugify(title);
        if (base.isBlank()) base = "photo";
        String slug = base;
        int n = 1;
        while (photoRepository.existsBySlug(slug)) {
            slug = base + "-" + n++;
        }
        return slug;
    }

    private String extensionOf(String filename, String contentType) {
        if (filename != null && filename.contains(".")) {
            String ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
            if (ext.matches("[a-z0-9]{2,5}")) return ext;
        }
        if (contentType != null && contentType.startsWith("image/")) {
            return contentType.substring("image/".length()).replace("jpeg", "jpg");
        }
        return "jpg";
    }
}