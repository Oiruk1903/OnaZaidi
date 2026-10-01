package com.onazaidi.album.controller;

import com.onazaidi.album.dto.AlbumResponse;
import com.onazaidi.album.service.AlbumService;
import com.onazaidi.common.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/albums")
@RequiredArgsConstructor
public class AlbumController {

    private final AlbumService service;

    @GetMapping
    public ApiResponse<List<AlbumResponse>> list() {
        return ApiResponse.ok(service.listPublic());
    }

    @GetMapping("/{slug}")
    public ApiResponse<AlbumResponse> get(@PathVariable String slug) {
        return ApiResponse.ok(service.getBySlug(slug));
    }
}