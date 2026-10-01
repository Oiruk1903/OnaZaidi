package com.onazaidi.experience.service;

import com.onazaidi.common.exception.BusinessException;
import com.onazaidi.common.exception.ResourceNotFoundException;
import com.onazaidi.common.util.SlugUtil;
import com.onazaidi.experience.dto.CreateExperienceRequest;
import com.onazaidi.experience.dto.ExperienceResponse;
import com.onazaidi.experience.dto.UpdateExperienceRequest;
import com.onazaidi.experience.entity.Experience;
import com.onazaidi.experience.repository.ExperienceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExperienceService {

    private final ExperienceRepository repository;

    public List<ExperienceResponse> listPublic() {
        return repository.findAllByStatusOrderByNameAsc("ACTIVE")
                .stream().map(this::toResponse).toList();
    }

    public List<ExperienceResponse> listAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    public ExperienceResponse getBySlug(String slug) {
        return toResponse(repository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Experience not found.")));
    }

    @Transactional
    public ExperienceResponse create(CreateExperienceRequest req) {
        String slug = SlugUtil.slugify(req.name());
        if (repository.existsBySlug(slug)) {
            throw new BusinessException("SLUG_IN_USE", "An experience with that name already exists.");
        }
        Experience exp = Experience.builder()
                .name(req.name())
                .slug(slug)
                .description(req.description())
                .build();
        return toResponse(repository.save(exp));
    }

    @Transactional
    public ExperienceResponse update(UUID id, UpdateExperienceRequest req) {
        Experience exp = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Experience not found."));

        if (req.name() != null && !req.name().equals(exp.getName())) {
            String slug = SlugUtil.slugify(req.name());
            if (!slug.equals(exp.getSlug()) && repository.existsBySlug(slug)) {
                throw new BusinessException("SLUG_IN_USE", "Slug is already taken.");
            }
            exp.setName(req.name());
            exp.setSlug(slug);
        }
        if (req.description() != null) exp.setDescription(req.description());
        if (req.status() != null) exp.setStatus(req.status());

        return toResponse(repository.save(exp));
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Experience not found.");
        }
        repository.deleteById(id);
    }

    public ExperienceResponse toResponse(Experience e) {
        return new ExperienceResponse(
                e.getId(), e.getName(), e.getSlug(),
                e.getDescription(), e.getStatus(), e.getCreatedAt()
        );
    }
}