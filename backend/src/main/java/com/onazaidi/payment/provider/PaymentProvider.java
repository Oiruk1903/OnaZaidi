package com.onazaidi.payment.provider;

import com.onazaidi.payment.dto.InitiatePaymentResponse;
import com.onazaidi.payment.dto.PaymentInitRequest;
import com.onazaidi.payment.dto.PaymentStatusResult;
import com.onazaidi.payment.dto.WebhookResult;

import java.math.BigDecimal;

public interface PaymentProvider {

    /** Stable name, e.g. "pesapal", "paypal". */
    String getName();

    /** Whether this provider is enabled by configuration. */
    boolean isEnabled();

    /**
     * Create the payment at the provider and return data needed to redirect the customer.
     * Must NOT capture money — just create the checkout session/order.
     */
    InitiatePaymentResponse initiate(PaymentInitRequest request);

    /**
     * Ask the provider for the authoritative status of a transaction.
     */
    PaymentStatusResult verify(String providerPaymentId);

    /**
     * Handle an inbound webhook: verify authenticity, return a normalized result.
     * Must be idempotent and side-effect free (persistence is done by PaymentService).
     */
    WebhookResult handleWebhook(String rawPayload, java.util.Map<String, String> headers);

    /**
     * Refund (fully or partially). Optional — may throw if unsupported.
     */
    default RefundResult refund(String providerPaymentId, BigDecimal amount) {
        throw new UnsupportedOperationException(getName() + " does not support refunds via this API yet.");
    }

    record RefundResult(boolean success, String reference, String message) {}
}