package com.onazaidi.payment.controller;

import com.onazaidi.payment.dto.WebhookResult;
import com.onazaidi.payment.provider.PaymentProvider;
import com.onazaidi.payment.provider.PaymentProviderFactory;
import com.onazaidi.payment.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/webhooks/payments")
@RequiredArgsConstructor
public class WebhookController {

    private final PaymentProviderFactory factory;
    private final PaymentService paymentService;

    @PostMapping("/{provider}")
    public ResponseEntity<Void> handle(@PathVariable String provider,
                                       HttpServletRequest request) throws IOException {
        String rawPayload = new String(request.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

        Map<String, String> headers = new HashMap<>();
        for (String h : Collections.list(request.getHeaderNames())) {
            headers.put(h.toLowerCase(), request.getHeader(h));
        }

        PaymentProvider p = factory.get(provider);
        WebhookResult result = p.handleWebhook(rawPayload, headers);

        // Persist for audit + idempotency
        paymentService.recordWebhook(provider, result, rawPayload);

        // Reconcile with the provider (authoritative)
        try {
            paymentService.processWebhook(provider, result);
        } catch (Exception e) {
            log.error("Webhook processing failed for {}: {}", provider, e.getMessage(), e);
            // Return 200 so the provider does not retry forever; we logged it.
        }

        return ResponseEntity.ok().build();
    }
}