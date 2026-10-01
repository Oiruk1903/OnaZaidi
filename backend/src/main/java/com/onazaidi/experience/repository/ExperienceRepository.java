package com.onazaidi.experience.repository;

import com.onazaidi.experience.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExperienceRepository extends JpaRepository<Experience, UUID> {
    Optional<Experience> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<Experience> findAllByStatusOrderByNameAsc(String status);
}