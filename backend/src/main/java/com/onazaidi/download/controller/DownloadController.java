package com.onazaidi.download.controller;

import com.onazaidi.common.api.ApiResponse;
import com.onazaidi.download.dto.DownloadUrlResponse;
import com.onazaidi.download.dto.PurchaseGroupResponse;
import com.onazaidi.download.service.DownloadService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/me/purchases")
@RequiredArgsConstructor
public class DownloadController {

    private final DownloadService downloadService;

    @GetMapping
    public ApiResponse<List<PurchaseGroupResponse>> purchases() {
        return ApiResponse.ok(downloadService.listMyPurchases());
    }

    @PostMapping("/{entitlementId}/download")
    public ApiResponse<DownloadUrlResponse> download(
            @PathVariable UUID entitlementId,
            HttpServletRequest http
    ) {
        String ip = header(http, "X-Forwarded-For", http.getRemoteAddr());
        String ua = http.getHeader("User-Agent");
        return ApiResponse.ok(downloadService.requestDownload(entitlementId, ip, ua));
    }

    private String header(HttpServletRequest r, String name, String fallback) {
        String v = r.getHeader(name);
        return (v == null || v.isBlank()) ? fallback : v.split(",")[0].trim();
    }
}
