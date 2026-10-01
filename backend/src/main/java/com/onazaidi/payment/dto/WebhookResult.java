package com.onazaidi.payment.dto;

public record WebhookResult(
        String eventId,
        String eventType,
        String providerPaymentId,
        String status,               // PAID / FAILED / CANCELLED / ...
        boolean signatureValid
) {}