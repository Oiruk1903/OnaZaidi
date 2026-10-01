package com.onazaidi.category.service;

import com.onazaidi.category.dto.CategoryResponse;
import com.onazaidi.category.entity.Category;
import com.onazaidi.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository repository;

    public List<CategoryResponse> listPublic() {
        return repository.findAllByStatusOrderByNameAsc("ACTIVE")
                .stream().map(this::toResponse).toList();
    }

    public CategoryResponse toResponse(Category c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getSlug(),
                c.getDescription(), c.getStatus());
    }
}