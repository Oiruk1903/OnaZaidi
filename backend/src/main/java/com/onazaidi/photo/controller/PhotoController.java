package com.onazaidi.photo.controller;

import com.onazaidi.common.api.ApiResponse;
import com.onazaidi.common.api.PageResponse;
import com.onazaidi.photo.dto.PhotoDetailResponse;
import com.onazaidi.photo.dto.PhotoFilterRequest;
import com.onazaidi.photo.dto.PhotoResponse;
import com.onazaidi.photo.service.PhotoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService service;

    @GetMapping
    public ApiResponse<PageResponse<PhotoResponse>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID albumId,
            @RequestParam(required = false) UUID destinationId,
            @RequestParam(required = false) UUID experienceId,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size
    ) {
        PhotoFilterRequest filter = new PhotoFilterRequest(
                search, albumId, destinationId, null, experienceId, categoryId,
                minPrice, maxPrice, null, sort
        );
        return ApiResponse.ok(service.searchPublic(filter, page, size));
    }

    @GetMapping("/{slug}")
    public ApiResponse<PhotoDetailResponse> get(@PathVariable String slug) {
        return ApiResponse.ok(service.getPublicBySlug(slug));
    }
}