package com.onazaidi.payment.provider.pesapal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PesapalAuthResponse(
        String token,
        @JsonProperty("expiryDate") String expiryDate,
        String error,
        String status,
        String message
) {}