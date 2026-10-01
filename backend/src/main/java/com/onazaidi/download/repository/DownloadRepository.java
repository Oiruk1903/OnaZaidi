package com.onazaidi.download.repository;

import com.onazaidi.download.entity.Download;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DownloadRepository extends JpaRepository<Download, UUID> {

    List<Download> findAllByEntitlementIdOrderByCreatedAtDesc(UUID entitlementId);

    List<Download> findAllByPhotoIdOrderByCreatedAtDesc(UUID photoId);

    long countByEntitlementId(UUID entitlementId);
}
