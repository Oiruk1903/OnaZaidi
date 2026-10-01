package com.onazaidi.album.repository;

import com.onazaidi.album.entity.Album;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AlbumRepository extends JpaRepository<Album, UUID> {
    Optional<Album> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<Album> findAllByStatusOrderByCreatedAtDesc(String status);
}