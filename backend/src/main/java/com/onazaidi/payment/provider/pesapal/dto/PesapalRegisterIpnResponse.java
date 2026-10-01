package com.onazaidi.payment.provider.pesapal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PesapalRegisterIpnResponse(
        @JsonProperty("url") String url,
        @JsonProperty("created_date") String createdDate,
        @JsonProperty("ipn_id") String ipnId,
        @JsonProperty("ipn_notification_type") String ipnNotificationType,
        String error,
        String status
) {}