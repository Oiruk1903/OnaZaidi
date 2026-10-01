package com.onazaidi.download.repository;

import com.onazaidi.download.entity.DownloadEntitlement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DownloadEntitlementRepository extends JpaRepository<DownloadEntitlement, UUID> {

    List<DownloadEntitlement> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    Page<DownloadEntitlement> findAllByUserId(UUID userId, Pageable pageable);

    Optional<DownloadEntitlement> findByIdAndUserId(UUID id, UUID userId);

    Optional<DownloadEntitlement> findByOrderItemId(UUID orderItemId);

    List<DownloadEntitlement> findAllByPhotoId(UUID photoId);

    long countByPhotoId(UUID photoId);
}
