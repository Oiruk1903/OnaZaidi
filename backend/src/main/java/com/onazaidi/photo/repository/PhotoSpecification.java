package com.onazaidi.photo.repository;

import com.onazaidi.photo.dto.PhotoFilterRequest;
import com.onazaidi.photo.entity.Photo;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class PhotoSpecification {

    private PhotoSpecification() {}

    public static Specification<Photo> fromFilter(PhotoFilterRequest f, boolean publicOnly) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (publicOnly) {
                predicates.add(cb.equal(root.get("status"), "PUBLISHED"));
            } else if (f.status() != null && !f.status().isBlank()) {
                predicates.add(cb.equal(root.get("status"), f.status()));
            }

            if (f.search() != null && !f.search().isBlank()) {
                String like = "%" + f.search().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like),
                        cb.like(cb.lower(root.get("description")), like)
                ));
            }

            addIfPresent(predicates, root, cb, "album", f.albumId());
            addIfPresent(predicates, root, cb, "destination", f.destinationId());
            addIfPresent(predicates, root, cb, "attraction", f.attractionId());
            addIfPresent(predicates, root, cb, "experience", f.experienceId());
            addIfPresent(predicates, root, cb, "category", f.categoryId());

            if (f.minPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), f.minPrice()));
            }
            if (f.maxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), f.maxPrice()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static void addIfPresent(List<Predicate> predicates,
                                     jakarta.persistence.criteria.Root<Photo> root,
                                     jakarta.persistence.criteria.CriteriaBuilder cb,
                                     String field, UUID id) {
        if (id != null) {
            predicates.add(cb.equal(root.get(field).get("id"), id));
        }
    }
}