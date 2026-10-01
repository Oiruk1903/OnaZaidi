package com.onazaidi.payment.provider.paypal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record PayPalCaptureResponse(
        String id,
        String status,
        @JsonProperty("purchase_units") List<PurchaseUnit> purchaseUnits
) {
    public record PurchaseUnit(
            @JsonProperty("reference_id") String referenceId,
            Payments payments
    ) {}

    public record Payments(
            List<Capture> captures
    ) {}

    public record Capture(
            String id,
            String status,
            Amount amount,
            @JsonProperty("create_time") String createTime
    ) {}

    public record Amount(
            @JsonProperty("currency_code") String currencyCode,
            String value
    ) {}
}