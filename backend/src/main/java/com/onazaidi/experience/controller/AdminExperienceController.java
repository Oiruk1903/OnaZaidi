package com.onazaidi.experience.controller;

import com.onazaidi.common.api.ApiResponse;
import com.onazaidi.experience.dto.CreateExperienceRequest;
import com.onazaidi.experience.dto.ExperienceResponse;
import com.onazaidi.experience.dto.UpdateExperienceRequest;
import com.onazaidi.experience.service.ExperienceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/experiences")
@RequiredArgsConstructor
public class AdminExperienceController {

    private final ExperienceService service;

    @GetMapping
    public ApiResponse<List<ExperienceResponse>> list() {
        return ApiResponse.ok(service.listAll());
    }

    @PostMapping
    public ApiResponse<ExperienceResponse> create(@Valid @RequestBody CreateExperienceRequest req) {
        return ApiResponse.ok(service.create(req), "Experience created.");
    }

    @PatchMapping("/{id}")
    public ApiResponse<ExperienceResponse> update(@PathVariable UUID id,
                                                  @Valid @RequestBody UpdateExperienceRequest req) {
        return ApiResponse.ok(service.update(id, req), "Experience updated.");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ApiResponse.ok(null, "Experience deleted.");
    }
}