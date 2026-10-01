package com.onazaidi.payment.dto;

public record InitiatePaymentClientResponse(
        String paymentId,
        String provider,
        String redirectUrl,
        String status
) {}