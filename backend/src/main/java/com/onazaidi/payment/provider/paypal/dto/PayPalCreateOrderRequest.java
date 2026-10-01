package com.onazaidi.payment.provider.paypal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record PayPalCreateOrderRequest(
        String intent,
        @JsonProperty("purchase_units") List<PurchaseUnit> purchaseUnits,
        @JsonProperty("application_context") ApplicationContext applicationContext
) {
    public record PurchaseUnit(
            @JsonProperty("reference_id") String referenceId,
            String description,
            Amount amount
    ) {}

    public record Amount(
            @JsonProperty("currency_code") String currencyCode,
            String value
    ) {}

    public record ApplicationContext(
            @JsonProperty("return_url") String returnUrl,
            @JsonProperty("cancel_url") String cancelUrl,
            @JsonProperty("brand_name") String brandName,
            @JsonProperty("user_action") String userAction,
            @JsonProperty("shipping_preference") String shippingPreference   // NO_SHIPPING for digital goods
    ) {}
}