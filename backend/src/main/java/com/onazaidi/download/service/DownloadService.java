package com.onazaidi.download.service;

import com.onazaidi.download.dto.DownloadUrlResponse;
import com.onazaidi.download.dto.PurchaseGroupResponse;
import com.onazaidi.download.dto.PurchaseItemResponse;
import com.onazaidi.download.entity.Download;
import com.onazaidi.download.entity.DownloadEntitlement;
import com.onazaidi.download.repository.DownloadEntitlementRepository;
import com.onazaidi.download.repository.DownloadRepository;
import com.onazaidi.order.entity.Order;
import com.onazaidi.order.repository.OrderRepository;
import com.onazaidi.security.CurrentUser;
import com.onazaidi.storage.StorageService;
import com.onazaidi.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DownloadService {

    private final DownloadEntitlementRepository entitlementRepository;
    private final DownloadRepository downloadRepository;
    private final OrderRepository orderRepository;
    private final SignedUrlService signedUrlService;
    private final StorageService storage;

    /**
     * Customer's purchase history, grouped by order.
     */
    @Transactional(readOnly = true)
    public List<PurchaseGroupResponse> listMyPurchases() {
        UUID userId = CurrentUser.id();
        List<DownloadEntitlement> entitlements =
                entitlementRepository.findAllByUserIdOrderByCreatedAtDesc(userId);

        // Group entitlements by their parent order
        Map<UUID, List<DownloadEntitlement>> byOrder = new LinkedHashMap<>();
        for (DownloadEntitlement e : entitlements) {
            UUID orderId = e.getOrderItem().getOrder().getId();
            byOrder.computeIfAbsent(orderId, k -> new ArrayList<>()).add(e);
        }

        List<PurchaseGroupResponse> result = new ArrayList<>();
        for (var entry : byOrder.entrySet()) {
            Order order = orderRepository.findById(entry.getKey()).orElse(null);
            if (order == null) continue;

            List<PurchaseItemResponse> items = entry.getValue().stream()
                    .map(this::toItemResponse)
                    .toList();

            result.add(new PurchaseGroupResponse(
                    order.getId(),
                    order.getOrderNumber(),
                    order.getStatus().name(),
                    order.getTotalAmount(),
                    order.getCurrency(),
                    order.getCreatedAt(),
                    items.size(),
                    items
            ));
        }
        return result;
    }

    /**
     * Issue a signed URL and record a Download row for audit.
     */
    @Transactional
    public DownloadUrlResponse requestDownload(UUID entitlementId, String ip, String userAgent) {
        DownloadUrlResponse url = signedUrlService.issue(entitlementId);

        DownloadEntitlement ent = entitlementRepository.findById(entitlementId)
                .orElseThrow(() -> new ResourceNotFoundException("Entitlement not found."));

        // Record the download and increment counter
        Download record = Download.builder()
                .entitlement(ent)
                .user(ent.getUser())
                .photo(ent.getPhoto())
                .ipAddress(ip)
                .userAgent(userAgent)
                .build();
        downloadRepository.save(record);

        ent.setDownloadCount(ent.getDownloadCount() + 1);
        ent.setLastDownloadedAt(Instant.now());
        if (ent.getDownloadCount() >= ent.getMaxDownloads()) {
            ent.setStatus("EXHAUSTED");
        }
        entitlementRepository.save(ent);

        log.info("User {} downloaded photo {} (entitlement {}), count now {}/{}",
                ent.getUser().getEmail(), ent.getPhoto().getId(), ent.getId(),
                ent.getDownloadCount(), ent.getMaxDownloads());

        return url;
    }

    private PurchaseItemResponse toItemResponse(DownloadEntitlement e) {
        var photo = e.getPhoto();
        String thumb = photo.getThumbnailStorageKey() != null
                ? storage.publicUrl(photo.getThumbnailStorageKey())
                : null;

        return new PurchaseItemResponse(
                e.getId(),
                photo.getId(),
                photo.getTitle(),
                photo.getSlug(),
                thumb,
                e.getStatus(),
                e.getDownloadCount(),
                e.getMaxDownloads(),
                e.canDownload(),
                e.getCreatedAt(),
                e.getLastDownloadedAt()
        );
    }
}
