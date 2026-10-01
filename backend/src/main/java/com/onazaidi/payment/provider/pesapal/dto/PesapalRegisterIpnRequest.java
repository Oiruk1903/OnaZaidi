package com.onazaidi.payment.provider.pesapal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PesapalRegisterIpnRequest(
        String url,
        @JsonProperty("ipn_notification_type") String ipnNotificationType   // "POST" or "GET"
) {}