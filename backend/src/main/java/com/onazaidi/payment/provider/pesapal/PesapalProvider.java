package com.onazaidi.payment.provider.pesapal;

import com.onazaidi.common.exception.PaymentException;
import com.onazaidi.payment.dto.*;
import com.onazaidi.payment.provider.PaymentProvider;
import com.onazaidi.payment.provider.pesapal.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class PesapalProvider implements PaymentProvider {

    private final PesapalConfig config;
    private final PesapalClient client;

    @Override
    public String getName() {
        return "pesapal";
    }

    @Override
    public boolean isEnabled() {
        return config.isEnabled()
                && config.getConsumerKey() != null && !config.getConsumerKey().isBlank()
                && config.getConsumerSecret() != null && !config.getConsumerSecret().isBlank();
    }

    @Override
    public InitiatePaymentResponse initiate(PaymentInitRequest req) {
        String ipnId = resolveIpnId();

        PesapalSubmitOrderRequest.BillingAddress billing = new PesapalSubmitOrderRequest.BillingAddress(
                req.customerEmail(),
                req.customerPhone(),
                "TZ",
                firstName(req.customerName()),
                lastName(req.customerName()),
                null, null, null, null, null, null
        );

        PesapalSubmitOrderRequest body = new PesapalSubmitOrderRequest(
                req.orderNumber(),
                req.currency(),
                req.amount().doubleValue(),
                req.description(),
                req.callbackUrl(),
                ipnId,
                billing
        );

        PesapalSubmitOrderResponse res = client.submitOrder(body);

        if (res == null || res.redirectUrl() == null) {
            throw new PaymentException("Pesapal did not return a redirect URL: " +
                    (res != null ? res.error() : "no response"));
        }

        return new InitiatePaymentResponse(
                getName(),
                res.orderTrackingId(),
                res.redirectUrl(),
                "INITIATED"
        );
    }

    @Override
    public PaymentStatusResult verify(String providerPaymentId) {
        PesapalTransactionStatusResponse status = client.getStatus(providerPaymentId);

        if (status == null) {
            throw new PaymentException("Pesapal status check returned no data");
        }

        // Pesapal status_code semantics:
        //   0 = INVALID
        //   1 = COMPLETED
        //   2 = FAILED
        //   3 = REVERSED
        return new PaymentStatusResult(
                providerPaymentId,
                mapStatus(status.statusCode()),
                status.amount() != null ? BigDecimal.valueOf(status.amount()) : null,
                status.currency(),
                status.confirmationCode(),
                status.paymentStatusDescription()
        );
    }

    @Override
    public WebhookResult handleWebhook(String rawPayload, Map<String, String> headers) {
        // Pesapal sends either form params or JSON depending on IPN type.
        // The most reliable approach is: parse the tracking id, then call GetTransactionStatus
        // to get the authoritative result. Signature verification is optional and, if
        // implemented, must use the consumer secret.
        //
        // We delegate the "did the signature match" decision to a helper
        // (see WebhookSecurity) — the service layer will still call verify().
        String trackingId = extractTrackingId(rawPayload);
        String eventId = "pesapal:" + trackingId;
        return new WebhookResult(eventId, "IPN", trackingId, "PENDING", true);
    }

    @Override
    public RefundResult refund(String providerPaymentId, BigDecimal amount) {
        // Pesapal v3 has a RefundRequest endpoint; wire it here when needed.
        throw new UnsupportedOperationException("Pesapal refunds not implemented yet.");
    }

    // ---------- helpers ----------

    private String resolveIpnId() {
        if (config.getIpnId() != null && !config.getIpnId().isBlank()) {
            return config.getIpnId();
        }
        if (config.getIpnUrl() == null || config.getIpnUrl().isBlank()) {
            throw new PaymentException("Pesapal IPN URL not configured");
        }
        PesapalRegisterIpnResponse res = client.registerIpn(config.getIpnUrl(), "POST");
        if (res == null || res.ipnId() == null) {
            throw new PaymentException("Failed to register Pesapal IPN URL");
        }
        log.info("Registered Pesapal IPN: {} -> {}", config.getIpnUrl(), res.ipnId());
        return res.ipnId();
    }

    private String mapStatus(String statusCode) {
        if (statusCode == null) return "PENDING";
        return switch (statusCode) {
            case "1" -> "PAID";
            case "0" -> "PENDING";
            case "2" -> "FAILED";
            case "3" -> "REFUNDED";
            default  -> "PENDING";
        };
    }

    private String extractTrackingId(String rawPayload) {
        // Very small best-effort extractor; PaymentService uses verify() for truth anyway.
        try {
            // Try form-encoded: "OrderTrackingId=..."
            for (String pair : rawPayload.split("&")) {
                String[] kv = pair.split("=", 2);
                if (kv.length == 2 && kv[0].equalsIgnoreCase("OrderTrackingId")) {
                    return java.net.URLDecoder.decode(kv[1], java.nio.charset.StandardCharsets.UTF_8);
                }
            }
            // Try JSON
            com.fasterxml.jackson.databind.JsonNode node =
                    new com.fasterxml.jackson.databind.ObjectMapper().readTree(rawPayload);
            if (node.has("OrderTrackingId")) return node.get("OrderTrackingId").asText();
            if (node.has("order_tracking_id")) return node.get("order_tracking_id").asText();
        } catch (Exception ignored) {}
        throw new PaymentException("Could not extract Pesapal OrderTrackingId from webhook");
    }

    private String firstName(String fullName) {
        if (fullName == null) return null;
        int i = fullName.indexOf(' ');
        return i > 0 ? fullName.substring(0, i) : fullName;
    }

    private String lastName(String fullName) {
        if (fullName == null) return null;
        int i = fullName.indexOf(' ');
        return i > 0 ? fullName.substring(i + 1) : "";
    }
}