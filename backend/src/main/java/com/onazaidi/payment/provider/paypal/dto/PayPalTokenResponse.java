package com.onazaidi.payment.provider.paypal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PayPalTokenResponse(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("token_type") String tokenType,
        @JsonProperty("expires_in") Integer expiresIn
) {}