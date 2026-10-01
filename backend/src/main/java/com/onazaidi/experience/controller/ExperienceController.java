package com.onazaidi.experience.controller;

import com.onazaidi.common.api.ApiResponse;
import com.onazaidi.experience.dto.ExperienceResponse;
import com.onazaidi.experience.service.ExperienceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/experiences")
@RequiredArgsConstructor
public class ExperienceController {

    private final ExperienceService service;

    @GetMapping
    public ApiResponse<List<ExperienceResponse>> list() {
        return ApiResponse.ok(service.listPublic());
    }

    @GetMapping("/{slug}")
    public ApiResponse<ExperienceResponse> get(@PathVariable String slug) {
        return ApiResponse.ok(service.getBySlug(slug));
    }
}