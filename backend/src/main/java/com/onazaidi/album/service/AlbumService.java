package com.onazaidi.album.service;

import com.onazaidi.album.dto.AlbumResponse;
import com.onazaidi.album.dto.CreateAlbumRequest;
import com.onazaidi.album.dto.UpdateAlbumRequest;
import com.onazaidi.album.entity.Album;
import com.onazaidi.album.repository.AlbumRepository;
import com.onazaidi.common.exception.BusinessException;
import com.onazaidi.common.exception.ResourceNotFoundException;
import com.onazaidi.common.util.SlugUtil;
import com.onazaidi.destination.entity.Destination;
import com.onazaidi.destination.repository.DestinationRepository;
import com.onazaidi.experience.entity.Experience;
import com.onazaidi.experience.repository.ExperienceRepository;
import com.onazaidi.security.CurrentUser;
import com.onazaidi.user.entity.User;
import com.onazaidi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;
    private final ExperienceRepository experienceRepository;

    public List<AlbumResponse> listPublic() {
        return albumRepository.findAllByStatusOrderByCreatedAtDesc("ACTIVE")
                .stream().map(this::toResponse).toList();
    }

    public List<AlbumResponse> listAll() {
        return albumRepository.findAll().stream().map(this::toResponse).toList();
    }

    public AlbumResponse getBySlug(String slug) {
        return toResponse(albumRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Album not found.")));
    }

    public Album getEntityById(UUID id) {
        return albumRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Album not found."));
    }

    @Transactional
    public AlbumResponse create(CreateAlbumRequest req) {
        User current = userRepository.findById(CurrentUser.id())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        String slug = SlugUtil.slugify(req.title());
        if (albumRepository.existsBySlug(slug)) {
            throw new BusinessException("SLUG_IN_USE", "An album with that title already exists.");
        }

        Album album = Album.builder()
                .createdBy(current)
                .title(req.title())
                .slug(slug)
                .description(req.description())
                .destination(req.destinationId() != null
                        ? destinationRepository.findById(req.destinationId()).orElse(null) : null)
                .experience(req.experienceId() != null
                        ? experienceRepository.findById(req.experienceId()).orElse(null) : null)
                .build();

        return toResponse(albumRepository.save(album));
    }

    @Transactional
    public AlbumResponse update(UUID id, UpdateAlbumRequest req) {
        Album album = getEntityById(id);

        if (req.title() != null && !req.title().equals(album.getTitle())) {
            String slug = SlugUtil.slugify(req.title());
            if (!slug.equals(album.getSlug()) && albumRepository.existsBySlug(slug)) {
                throw new BusinessException("SLUG_IN_USE", "Slug is already taken.");
            }
            album.setTitle(req.title());
            album.setSlug(slug);
        }

        if (req.description() != null) album.setDescription(req.description());

        if (req.destinationId() != null) {
            Destination d = destinationRepository.findById(req.destinationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Destination not found."));
            album.setDestination(d);
        }

        if (req.experienceId() != null) {
            Experience e = experienceRepository.findById(req.experienceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Experience not found."));
            album.setExperience(e);
        }

        if (req.coverPhotoId() != null) album.setCoverPhotoId(req.coverPhotoId());
        if (req.status() != null) album.setStatus(req.status());

        return toResponse(albumRepository.save(album));
    }

    @Transactional
    public void delete(UUID id) {
        if (!albumRepository.existsById(id)) {
            throw new ResourceNotFoundException("Album not found.");
        }
        albumRepository.deleteById(id);
    }

    public AlbumResponse toResponse(Album a) {
        return new AlbumResponse(
                a.getId(),
                a.getTitle(),
                a.getSlug(),
                a.getDescription(),
                a.getDestination() != null ? a.getDestination().getId() : null,
                a.getDestination() != null ? a.getDestination().getName() : null,
                a.getExperience() != null ? a.getExperience().getId() : null,
                a.getExperience() != null ? a.getExperience().getName() : null,
                a.getCoverPhotoId(),
                a.getStatus(),
                a.getCreatedAt()
        );
    }
}