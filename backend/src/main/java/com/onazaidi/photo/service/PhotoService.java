package com.onazaidi.photo.service;

import com.onazaidi.album.entity.Album;
import com.onazaidi.album.repository.AlbumRepository;
import com.onazaidi.category.entity.Category;
import com.onazaidi.category.repository.CategoryRepository;
import com.onazaidi.common.api.PageResponse;
import com.onazaidi.common.exception.BusinessException;
import com.onazaidi.common.exception.ResourceNotFoundException;
import com.onazaidi.common.util.SlugUtil;
import com.onazaidi.destination.entity.Attraction;
import com.onazaidi.destination.entity.Destination;
import com.onazaidi.destination.repository.AttractionRepository;
import com.onazaidi.destination.repository.DestinationRepository;
import com.onazaidi.experience.entity.Experience;
import com.onazaidi.experience.repository.ExperienceRepository;
import com.onazaidi.order.repository.OrderItemRepository;
import com.onazaidi.photo.dto.PhotoDetailResponse;
import com.onazaidi.photo.dto.PhotoFilterRequest;
import com.onazaidi.photo.dto.PhotoResponse;
import com.onazaidi.photo.dto.PhotoUpdateRequest;
import com.onazaidi.photo.entity.Photo;
import com.onazaidi.photo.repository.PhotoRepository;
import com.onazaidi.photo.repository.PhotoSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PhotoService {

    private final PhotoRepository photoRepository;
    private final AlbumRepository albumRepository;
    private final DestinationRepository destinationRepository;
    private final AttractionRepository attractionRepository;
    private final ExperienceRepository experienceRepository;
    private final CategoryRepository categoryRepository;
    private final OrderItemRepository orderItemRepository;
    private final PhotoMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<PhotoResponse> searchPublic(PhotoFilterRequest filter, int page, int size) {
        Page<Photo> result = runSearch(filter, page, size, true);
        return PageResponse.from(result, mapper::toSummary);
    }

    @Transactional(readOnly = true)
    public PageResponse<PhotoResponse> searchAdmin(PhotoFilterRequest filter, int page, int size) {
        Page<Photo> result = runSearch(filter, page, size, false);
        return PageResponse.from(result, mapper::toSummary);
    }

    private Page<Photo> runSearch(PhotoFilterRequest filter, int page, int size, boolean publicOnly) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), sortOf(filter.sort()));
        return photoRepository.findAll(PhotoSpecification.fromFilter(filter, publicOnly), pageable);
    }

    private Sort sortOf(String sort) {
        if (sort == null) return Sort.by(Sort.Direction.DESC, "createdAt");
        return switch (sort) {
            case "oldest"       -> Sort.by(Sort.Direction.ASC, "createdAt");
            case "price_asc"    -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc"   -> Sort.by(Sort.Direction.DESC, "price");
            case "title_asc"    -> Sort.by(Sort.Direction.ASC, "title");
            default             -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    @Transactional(readOnly = true)
    public PhotoDetailResponse getPublicBySlug(String slug) {
        Photo photo = photoRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Photo not found."));
        if (!"PUBLISHED".equals(photo.getStatus())) {
            throw new ResourceNotFoundException("Photo not found.");
        }
        return mapper.toDetail(photo);
    }

    @Transactional(readOnly = true)
    public Photo getEntityById(UUID id) {
        return photoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Photo not found."));
    }

    @Transactional
    public void update(UUID id, PhotoUpdateRequest req) {
        Photo photo = getEntityById(id);

        if (req.title() != null && !req.title().equals(photo.getTitle())) {
            String slug = SlugUtil.slugify(req.title());
            if (!slug.equals(photo.getSlug()) && photoRepository.existsBySlug(slug)) {
                throw new BusinessException("SLUG_IN_USE", "Slug is already taken.");
            }
            photo.setTitle(req.title());
            photo.setSlug(slug);
        }

        if (req.description() != null) photo.setDescription(req.description());

        if (req.albumId() != null) photo.setAlbum(albumRepository.findById(req.albumId()).orElse(null));
        if (req.destinationId() != null) photo.setDestination(destinationRepository.findById(req.destinationId()).orElse(null));
        if (req.attractionId() != null) photo.setAttraction(attractionRepository.findById(req.attractionId()).orElse(null));
        if (req.experienceId() != null) photo.setExperience(experienceRepository.findById(req.experienceId()).orElse(null));
        if (req.categoryId() != null) photo.setCategory(categoryRepository.findById(req.categoryId()).orElse(null));

        if (req.price() != null) photo.setPrice(req.price());
        if (req.currency() != null) photo.setCurrency(req.currency());
        if (req.status() != null) photo.setStatus(req.status());

        photoRepository.save(photo);
    }

    @Transactional
    public void publish(UUID id) {
        Photo p = getEntityById(id);
        p.setStatus("PUBLISHED");
        photoRepository.save(p);
    }

    @Transactional
    public void archive(UUID id) {
        Photo p = getEntityById(id);
        p.setStatus("ARCHIVED");
        photoRepository.save(p);
    }

    @Transactional
    public void delete(UUID id) {
        Photo photo = photoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Photo not found."));

        // Check if photo has been purchased
        boolean hasPurchases = orderItemRepository.existsByPhotoId(id);
        if (hasPurchases) {
            throw new BusinessException("PHOTO_HAS_PURCHASES", "Cannot delete photo that has been purchased. Archive it instead.");
        }

        photoRepository.deleteById(id);
    }
}