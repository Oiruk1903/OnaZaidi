package com.onazaidi.destination.repository;

import com.onazaidi.destination.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DestinationRepository extends JpaRepository<Destination, UUID> {
    Optional<Destination> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsByNameIgnoreCase(String name);
    List<Destination> findAllByStatusOrderByNameAsc(String status);
}
