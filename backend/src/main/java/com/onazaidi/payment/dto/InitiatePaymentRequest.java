package com.onazaidi.payment.dto;

import jakarta.validation.constraints.NotBlank;

public record InitiatePaymentRequest(
        @NotBlank String orderNumber,
        @NotBlank String provider
) {}