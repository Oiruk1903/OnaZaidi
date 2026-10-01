package com.onazaidi.destination.service;

import com.onazaidi.common.exception.BusinessException;
import com.onazaidi.common.exception.ResourceNotFoundException;
import com.onazaidi.common.util.SlugUtil;
import com.onazaidi.destination.dto.CreateDestinationRequest;
import com.onazaidi.destination.dto.DestinationResponse;
import com.onazaidi.destination.dto.UpdateDestinationRequest;
import com.onazaidi.destination.entity.Destination;
import com.onazaidi.destination.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DestinationService {

    private final DestinationRepository repository;

    public List<DestinationResponse> listPublic() {
        return repository.findAllByStatusOrderByNameAsc("ACTIVE")
                .stream().map(this::toResponse).toList();
    }

    public List<DestinationResponse> listAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    public DestinationResponse getBySlug(String slug) {
        return toResponse(repository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found.")));
    }

    @Transactional
    public DestinationResponse create(CreateDestinationRequest req) {
        String slug = SlugUtil.slugify(req.name());
        if (repository.existsBySlug(slug)) {
            throw new BusinessException("SLUG_IN_USE", "A destination with that name already exists.");
        }

        Destination dest = Destination.builder()
                .name(req.name())
                .slug(slug)
                .description(req.description())
                .region(req.region())
                .country(req.country() != null ? req.country() : "Tanzania")
                .coverImageKey(req.coverImageKey())
                .seoTitle(req.seoTitle())
                .seoDescription(req.seoDescription())
                .build();

        return toResponse(repository.save(dest));
    }

    @Transactional
    public DestinationResponse update(UUID id, UpdateDestinationRequest req) {
        Destination dest = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found."));

        if (req.name() != null && !req.name().equals(dest.getName())) {
            String slug = SlugUtil.slugify(req.name());
            if (!slug.equals(dest.getSlug()) && repository.existsBySlug(slug)) {
                throw new BusinessException("SLUG_IN_USE", "Slug is already taken.");
            }
            dest.setName(req.name());
            dest.setSlug(slug);
        }
        if (req.region() != null) dest.setRegion(req.region());
        if (req.country() != null) dest.setCountry(req.country());
        if (req.description() != null) dest.setDescription(req.description());
        if (req.coverImageKey() != null) dest.setCoverImageKey(req.coverImageKey());
        if (req.status() != null) dest.setStatus(req.status());
        if (req.seoTitle() != null) dest.setSeoTitle(req.seoTitle());
        if (req.seoDescription() != null) dest.setSeoDescription(req.seoDescription());

        return toResponse(repository.save(dest));
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Destination not found.");
        }
        repository.deleteById(id);
    }

    public DestinationResponse toResponse(Destination d) {
        return new DestinationResponse(
                d.getId(), d.getName(), d.getSlug(), d.getDescription(),
                d.getRegion(), d.getCountry(), d.getCoverImageKey(),
                d.getStatus(), d.getCreatedAt()
        );
    }
}
