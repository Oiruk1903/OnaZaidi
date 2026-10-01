package com.onazaidi.payment.provider.paypal;

import com.fasterxml.jackson.databind.JsonNode;
import com.onazaidi.config.PayPalConfig;
import com.onazaidi.payment.provider.paypal.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
@Component
@RequiredArgsConstructor
public class PayPalClient {

    private final PayPalConfig config;

    private final RestClient http = RestClient.builder()
            .baseUrl("http://placeholder")
            .build();

    private final AtomicReference<CachedToken> tokenCache = new AtomicReference<>();

    private record CachedToken(String token, Instant expiresAt) {}

    private String basicAuth() {
        String raw = config.getClientId() + ":" + config.getClientSecret();
        return "Basic " + Base64.getEncoder().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    public String getAccessToken() {
        CachedToken cached = tokenCache.get();
        if (cached != null && Instant.now().isBefore(cached.expiresAt().minusSeconds(30))) {
            return cached.token();
        }

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");

        PayPalTokenResponse res = http.post()
                .uri(config.getBaseUrl() + "/v1/oauth2/token")
                .header("Authorization", basicAuth())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(PayPalTokenResponse.class);

        if (res == null || res.accessToken() == null) {
            throw new IllegalStateException("PayPal auth failed");
        }

        long ttl = res.expiresIn() != null ? res.expiresIn() : 3000;
        tokenCache.set(new CachedToken(res.accessToken(), Instant.now().plusSeconds(ttl)));
        return res.accessToken();
    }

    public PayPalCreateOrderResponse createOrder(PayPalCreateOrderRequest req) {
        return http.post()
                .uri(config.getBaseUrl() + "/v2/checkout/orders")
                .header("Authorization", "Bearer " + getAccessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .body(req)
                .retrieve()
                .body(PayPalCreateOrderResponse.class);
    }

    public PayPalCaptureResponse captureOrder(String orderId) {
        return http.post()
                .uri(config.getBaseUrl() + "/v2/checkout/orders/" + orderId + "/capture")
                .header("Authorization", "Bearer " + getAccessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of())
                .retrieve()
                .body(PayPalCaptureResponse.class);
    }

    public JsonNode getOrder(String orderId) {
        return http.get()
                .uri(config.getBaseUrl() + "/v2/checkout/orders/" + orderId)
                .header("Authorization", "Bearer " + getAccessToken())
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode verifyWebhookSignature(String rawPayload, Map<String, String> headers) {
        // PayPal webhook signature verification uses the header set described in
        // PayPal's VerifyWebhookSignature API [citation:5] and StackOverflow examples [citation:14].
        // The reliable production approach is to POST these fields to
        //   /v1/notifications/verify-webhook-signature
        // with the webhook_id configured in the PayPal dashboard.
        var body = Map.of(
                "auth_algo", headers.getOrDefault("paypal-auth-algo", ""),
                "cert_url", headers.getOrDefault("paypal-cert-url", ""),
                "transmission_id", headers.getOrDefault("paypal-transmission-id", ""),
                "transmission_sig", headers.getOrDefault("paypal-transmission-sig", ""),
                "transmission_time", headers.getOrDefault("paypal-transmission-time", ""),
                "webhook_id", config.getWebhookId(),
                "webhook_event", rawPayload
        );

        return http.post()
                .uri(config.getBaseUrl() + "/v1/notifications/verify-webhook-signature")
                .header("Authorization", "Bearer " + getAccessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }
}