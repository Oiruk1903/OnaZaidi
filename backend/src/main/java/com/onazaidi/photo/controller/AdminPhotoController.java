package com.onazaidi.photo.controller;

import com.onazaidi.common.api.ApiResponse;
import com.onazaidi.common.api.PageResponse;
import com.onazaidi.photo.dto.PhotoFilterRequest;
import com.onazaidi.photo.dto.PhotoResponse;
import com.onazaidi.photo.dto.PhotoUpdateRequest;
import com.onazaidi.photo.service.PhotoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/photos")
@RequiredArgsConstructor
public class AdminPhotoController {

    private final PhotoService service;

    @GetMapping
    public ApiResponse<PageResponse<PhotoResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID albumId,
            @RequestParam(required = false) UUID destinationId,
            @RequestParam(required = false) UUID experienceId,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size
    ) {
        PhotoFilterRequest filter = new PhotoFilterRequest(
                search, albumId, destinationId, null, experienceId, categoryId,
                null, null, status, sort
        );
        return ApiResponse.ok(service.searchAdmin(filter, page, size));
    }

    @PatchMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable UUID id,
                                    @Valid @RequestBody PhotoUpdateRequest req) {
        service.update(id, req);
        return ApiResponse.ok(null, "Photo updated.");
    }

    @PostMapping("/{id}/publish")
    public ApiResponse<Void> publish(@PathVariable UUID id) {
        service.publish(id);
        return ApiResponse.ok(null, "Photo published.");
    }

    @PostMapping("/{id}/archive")
    public ApiResponse<Void> archive(@PathVariable UUID id) {
        service.archive(id);
        return ApiResponse.ok(null, "Photo archived.");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ApiResponse.ok(null, "Photo deleted.");
    }
}