package com.onazaidi.album.controller;

import com.onazaidi.album.dto.AlbumResponse;
import com.onazaidi.album.dto.CreateAlbumRequest;
import com.onazaidi.album.dto.UpdateAlbumRequest;
import com.onazaidi.album.service.AlbumService;
import com.onazaidi.common.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/albums")
@RequiredArgsConstructor
public class AdminAlbumController {

    private final AlbumService service;

    @GetMapping
    public ApiResponse<List<AlbumResponse>> list() {
        return ApiResponse.ok(service.listAll());
    }

    @PostMapping
    public ApiResponse<AlbumResponse> create(@Valid @RequestBody CreateAlbumRequest req) {
        return ApiResponse.ok(service.create(req), "Album created.");
    }

    @PatchMapping("/{id}")
    public ApiResponse<AlbumResponse> update(@PathVariable UUID id,
                                             @Valid @RequestBody UpdateAlbumRequest req) {
        return ApiResponse.ok(service.update(id, req), "Album updated.");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ApiResponse.ok(null, "Album deleted.");
    }
}