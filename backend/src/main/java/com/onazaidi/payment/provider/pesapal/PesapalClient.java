package com.onazaidi.payment.provider.pesapal;

import com.fasterxml.jackson.databind.JsonNode;
import com.onazaidi.payment.provider.pesapal.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
@Component
@RequiredArgsConstructor
public class PesapalClient {

    private final PesapalConfig config;

    private final RestClient http = RestClient.builder()
            .baseUrl("http://placeholder")   // replaced per-request below
            .build();

    private final AtomicReference<CachedToken> tokenCache = new AtomicReference<>();

    private record CachedToken(String token, Instant expiresAt) {}

    // ---------- auth ----------

    public String getToken() {
        CachedToken cached = tokenCache.get();
        if (cached != null && Instant.now().isBefore(cached.expiresAt().minusSeconds(30))) {
            return cached.token();
        }
        PesapalAuthResponse res = http.post()
                .uri(config.getBaseUrl() + "/api/Auth/RequestToken")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "consumer_key", config.getConsumerKey(),
                        "consumer_secret", config.getConsumerSecret()
                ))
                .retrieve()
                .body(PesapalAuthResponse.class);

        if (res == null || res.token() == null) {
            throw new IllegalStateException("Pesapal auth failed: " +
                    (res != null ? res.message() : "no response"));
        }

        // Pesapal tokens expire after ~5 minutes; we buffer 30s.
        tokenCache.set(new CachedToken(res.token(), Instant.now().plusSeconds(270)));
        return res.token();
    }

    // ---------- IPN registration ----------

    public PesapalRegisterIpnResponse registerIpn(String url, String type) {
        return http.post()
                .uri(config.getBaseUrl() + "/api/URLSetup/RegisterIPN")
                .header("Authorization", "Bearer " + getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .body(new PesapalRegisterIpnRequest(url, type))
                .retrieve()
                .body(PesapalRegisterIpnResponse.class);
    }

    // ---------- submit order ----------

    public PesapalSubmitOrderResponse submitOrder(PesapalSubmitOrderRequest req) {
        return http.post()
                .uri(config.getBaseUrl() + "/api/Transactions/SubmitOrderRequest")
                .header("Authorization", "Bearer " + getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .body(req)
                .retrieve()
                .body(PesapalSubmitOrderResponse.class);
    }

    // ---------- status (AUTHORITATIVE) ----------

    public PesapalTransactionStatusResponse getStatus(String orderTrackingId) {
        return http.get()
                .uri(config.getBaseUrl() +
                        "/api/Transactions/GetTransactionStatus?orderTrackingId=" + orderTrackingId)
                .header("Authorization", "Bearer " + getToken())
                .retrieve()
                .body(PesapalTransactionStatusResponse.class);
    }

    public JsonNode rawStatus(String orderTrackingId) {
        return http.get()
                .uri(config.getBaseUrl() +
                        "/api/Transactions/GetTransactionStatus?orderTrackingId=" + orderTrackingId)
                .header("Authorization", "Bearer " + getToken())
                .retrieve()
                .body(JsonNode.class);
    }
}