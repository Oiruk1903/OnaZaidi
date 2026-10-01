package com.onazaidi.destination.controller;

import com.onazaidi.common.api.ApiResponse;
import com.onazaidi.destination.dto.DestinationResponse;
import com.onazaidi.destination.service.DestinationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/destinations")
@RequiredArgsConstructor
public class DestinationController {

    private final DestinationService service;

    @GetMapping
    public ApiResponse<List<DestinationResponse>> list() {
        return ApiResponse.ok(service.listPublic());
    }

    @GetMapping("/{slug}")
    public ApiResponse<DestinationResponse> get(@PathVariable String slug) {
        return ApiResponse.ok(service.getBySlug(slug));
    }
}
