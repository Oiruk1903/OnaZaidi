package com.onazaidi.destination.repository;

import com.onazaidi.destination.entity.Attraction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttractionRepository extends JpaRepository<Attraction, UUID> {
    Optional<Attraction> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<Attraction> findAllByDestinationIdAndStatusOrderByNameAsc(UUID destinationId, String status);
}