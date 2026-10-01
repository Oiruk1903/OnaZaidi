package com.onazaidi.photo.controller;

import com.onazaidi.common.api.ApiResponse;
import com.onazaidi.photo.dto.PhotoDetailResponse;
import com.onazaidi.photo.dto.PhotoUploadRequest;
import com.onazaidi.photo.service.PhotoUploadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/photos")
@RequiredArgsConstructor
public class AdminPhotoUploadController {

    private final PhotoUploadService uploadService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ApiResponse<PhotoDetailResponse> upload(
        @RequestPart("file") MultipartFile file,
        @RequestPart("meta") String metaJson
) {
    PhotoUploadRequest meta;
    try {
        meta = new com.fasterxml.jackson.databind.ObjectMapper()
                .readValue(metaJson, PhotoUploadRequest.class);
    } catch (Exception e) {
        throw new com.onazaidi.common.exception.BusinessException(
                "INVALID_META", "Invalid metadata payload: " + e.getMessage());
    }
    return ApiResponse.ok(uploadService.upload(file, meta), "Photo uploaded.");
}

    @PostMapping("/{id}/publish-with-watermark")
    public ApiResponse<PhotoDetailResponse> publish(@PathVariable UUID id) {
        return ApiResponse.ok(uploadService.publish(id), "Photo published.");
    }
}
