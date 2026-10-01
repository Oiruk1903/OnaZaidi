package com.onazaidi.photo.controller;

import com.onazaidi.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.HandlerMapping;

import jakarta.servlet.http.HttpServletRequest;
import java.io.InputStream;

/**
 * Serves public preview/thumbnail files when using local storage.
 * Enabled only in `storage.provider=local`.
 */
@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
@ConditionalOnProperty(name = "storage.provider", havingValue = "local", matchIfMissing = true)
public class FileServeController {

    private final StorageService storage;

    @GetMapping("/**")
    public ResponseEntity<InputStreamResource> serve(HttpServletRequest request) {
        String path = (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
        String key = path.replaceFirst("^/files/", "");

        // Public files only — originals must never be served here.
        if (!(key.startsWith("previews/") ||
              key.startsWith("thumbnails/") ||
              key.startsWith("watermarked/") ||
              key.startsWith("covers/"))) {
            return ResponseEntity.notFound().build();
        }

        if (!storage.exists(key)) return ResponseEntity.notFound().build();

        InputStream in = storage.get(key);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(new InputStreamResource(in));
    }
}
