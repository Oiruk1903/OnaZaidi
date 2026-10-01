package com.onazaidi.destination.controller;

import com.onazaidi.common.api.ApiResponse;
import com.onazaidi.destination.dto.CreateDestinationRequest;
import com.onazaidi.destination.dto.DestinationResponse;
import com.onazaidi.destination.dto.UpdateDestinationRequest;
import com.onazaidi.destination.service.DestinationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/destinations")
@RequiredArgsConstructor
public class AdminDestinationController {

    private final DestinationService service;

    @GetMapping
    public ApiResponse<List<DestinationResponse>> list() {
        return ApiResponse.ok(service.listAll());
    }

    @PostMapping
    public ApiResponse<DestinationResponse> create(@Valid @RequestBody CreateDestinationRequest req) {
        return ApiResponse.ok(service.create(req), "Destination created.");
    }

    @PatchMapping("/{id}")
    public ApiResponse<DestinationResponse> update(@PathVariable UUID id,
                                                   @Valid @RequestBody UpdateDestinationRequest req) {
        return ApiResponse.ok(service.update(id, req), "Destination updated.");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ApiResponse.ok(null, "Destination deleted.");
    }
}
