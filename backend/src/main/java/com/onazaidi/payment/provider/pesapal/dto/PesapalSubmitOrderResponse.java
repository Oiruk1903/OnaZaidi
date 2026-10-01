package com.onazaidi.payment.provider.pesapal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PesapalSubmitOrderResponse(
        @JsonProperty("order_tracking_id") String orderTrackingId,
        @JsonProperty("merchant_reference") String merchantReference,
        @JsonProperty("redirect_url") String redirectUrl,
        String error,
        String status
) {}