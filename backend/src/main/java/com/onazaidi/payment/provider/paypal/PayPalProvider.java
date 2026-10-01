package com.onazaidi.payment.provider.paypal;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.onazaidi.common.exception.PaymentException;
import com.onazaidi.config.PayPalConfig;
import com.onazaidi.payment.dto.*;
import com.onazaidi.payment.provider.PaymentProvider;
import com.onazaidi.payment.provider.paypal.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class PayPalProvider implements PaymentProvider {

    private final PayPalConfig config;
    private final PayPalClient client;
    private final ObjectMapper objectMapper;

    @Override
    public String getName() {
        return "paypal";
    }

    @Override
    public boolean isEnabled() {
        return config.isEnabled()
                && config.getClientId() != null && !config.getClientId().isBlank()
                && config.getClientSecret() != null && !config.getClientSecret().isBlank();
    }

    @Override
    public InitiatePaymentResponse initiate(PaymentInitRequest req) {
        PayPalCreateOrderRequest body = new PayPalCreateOrderRequest(
                "CAPTURE",
                List.of(new PayPalCreateOrderRequest.PurchaseUnit(
                        req.orderNumber(),
                        req.description(),
                        new PayPalCreateOrderRequest.Amount(
                                req.currency(),
                                req.amount().setScale(2, java.math.RoundingMode.HALF_UP).toPlainString()
                        )
                )),
                new PayPalCreateOrderRequest.ApplicationContext(
                        req.callbackUrl(),
                        config.getCancelUrl(),
                        "OnaZaidi",
                        "PAY_NOW",
                        "NO_SHIPPING"          // digital goods
                )
        );

        PayPalCreateOrderResponse res = client.createOrder(body);

        if (res == null || res.id() == null) {
            throw new PaymentException("PayPal did not return an order id");
        }

        String approvalUrl = res.links() == null ? null : res.links().stream()
                .filter(l -> "approve".equalsIgnoreCase(l.rel()))
                .map(PayPalCreateOrderResponse.Link::href)
                .findFirst().orElse(null);

        if (approvalUrl == null) {
            throw new PaymentException("PayPal did not return an approval URL");
        }

        return new InitiatePaymentResponse(getName(), res.id(), approvalUrl, "INITIATED");
    }

    @Override
    public PaymentStatusResult verify(String providerPaymentId) {
        // If the buyer has completed approval, capture will finalize.
        // If already captured, GET /v2/checkout/orders/{id} returns COMPLETED.
        JsonNode order = client.getOrder(providerPaymentId);
        if (order == null) {
            throw new PaymentException("PayPal order not found");
        }

        String status = order.path("status").asText("UNKNOWN");
        BigDecimal amount = null;
        String currency = null;

        JsonNode purchaseUnits = order.path("purchase_units");
        if (purchaseUnits.isArray() && purchaseUnits.size() > 0) {
            JsonNode amt = purchaseUnits.get(0).path("amount");
            if (!amt.isMissingNode()) {
                currency = amt.path("currency_code").asText(null);
                String value = amt.path("value").asText(null);
                if (value != null) amount = new BigDecimal(value);
            }
        }

        return new PaymentStatusResult(
                providerPaymentId,
                mapStatus(status),
                amount,
                currency,
                providerPaymentId,
                status
        );
    }

    @Override
    public WebhookResult handleWebhook(String rawPayload, Map<String, String> headers) {
        boolean signatureValid;
        try {
            JsonNode res = client.verifyWebhookSignature(rawPayload, headers);
            signatureValid = res != null &&
                    "SUCCESS".equalsIgnoreCase(res.path("verification_status").asText());
        } catch (Exception e) {
            log.warn("PayPal webhook signature verification failed: {}", e.getMessage());
            signatureValid = false;
        }

        try {
            JsonNode root = objectMapper.readTree(rawPayload);
            String eventId = root.path("id").asText();
            String eventType = root.path("event_type").asText();
            String orderId = root.path("resource")
                    .path("supplementary_data")
                    .path("related_ids")
                    .path("order_id").asText(null);

            // resource.id is the capture id for PAYMENT.CAPTURE.* events
            String resourceId = root.path("resource").path("id").asText(null);
            String providerPaymentId = orderId != null ? orderId : resourceId;

            return new WebhookResult(eventId, eventType, providerPaymentId, "PENDING", signatureValid);
        } catch (Exception e) {
            throw new PaymentException("Failed to parse PayPal webhook: " + e.getMessage());
        }
    }

    private String mapStatus(String paypalStatus) {
        return switch (paypalStatus) {
            case "COMPLETED" -> "PAID";
            case "APPROVED", "CREATED", "SAVED", "PAYER_ACTION_REQUIRED" -> "PENDING";
            case "VOIDED" -> "CANCELLED";
            default -> "PENDING";
        };
    }
}