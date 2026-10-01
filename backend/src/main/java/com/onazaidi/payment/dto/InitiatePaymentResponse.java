package com.onazaidi.payment.dto;

public record InitiatePaymentResponse(
        String provider,
        String providerPaymentId,   // tracking id / PayPal order id
        String redirectUrl,         // where to send the customer
        String status               // INITIATED / PENDING / ...
) {}