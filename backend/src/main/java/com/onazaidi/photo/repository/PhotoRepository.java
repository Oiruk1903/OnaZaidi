package com.onazaidi.photo.repository;

import com.onazaidi.photo.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface PhotoRepository extends JpaRepository<Photo, UUID>,
        JpaSpecificationExecutor<Photo> {

    Optional<Photo> findBySlug(String slug);
    boolean existsBySlug(String slug);
}