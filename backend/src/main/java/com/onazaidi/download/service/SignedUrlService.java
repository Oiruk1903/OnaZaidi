package com.onazaidi.download.service;

import com.onazaidi.download.dto.DownloadUrlResponse;
import com.onazaidi.download.entity.DownloadEntitlement;
import com.onazaidi.download.repository.DownloadEntitlementRepository;
import com.onazaidi.storage.StorageService;
import com.onazaidi.common.exception.BusinessException;
import com.onazaidi.common.exception.ForbiddenException;
import com.onazaidi.common.exception.ResourceNotFoundException;
import com.onazaidi.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SignedUrlService {

    private final DownloadEntitlementRepository entitlementRepository;
    private final StorageService storage;

    @Value("${storage.signed-url-expiry-seconds:300}")
    private long signedUrlExpirySeconds;

    @Transactional(readOnly = true)
    public DownloadUrlResponse issue(UUID entitlementId) {
        UUID userId = CurrentUser.id();

        DownloadEntitlement ent = entitlementRepository.findById(entitlementId)
                .orElseThrow(() -> new ResourceNotFoundException("Entitlement not found."));

        // Ownership check (unless admin)
        if (!ent.getUser().getId().equals(userId) && !CurrentUser.isAdmin()) {
            throw new ForbiddenException("You do not own this download.");
        }

        if (!ent.isActive()) {
            throw new BusinessException("ENTITLEMENT_INACTIVE", "This download is no longer available.");
        }
        if (ent.getDownloadCount() >= ent.getMaxDownloads()) {
            throw new BusinessException("DOWNLOAD_LIMIT_REACHED",
                    "You have reached the maximum number of downloads for this photo.");
        }

        String key = ent.getPhoto().getOriginalStorageKey();
        if (key == null || key.isBlank()) {
            throw new BusinessException("FILE_MISSING", "The original file is not available.");
        }
        if (!storage.exists(key)) {
            throw new BusinessException("FILE_MISSING", "The original file is not available.");
        }

        Duration expiry = Duration.ofSeconds(signedUrlExpirySeconds);
        String url = storage.generateSignedUrl(key, expiry);

        return new DownloadUrlResponse(
                url,
                Instant.now().plus(expiry),
                ent.getMaxDownloads() - ent.getDownloadCount()
        );
    }
}
