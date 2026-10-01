package com.onazaidi.payment.provider.pesapal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PesapalSubmitOrderRequest(
        String id,
        String currency,
        Double amount,
        String description,
        @JsonProperty("callback_url") String callbackUrl,
        @JsonProperty("notification_id") String notificationId,
        @JsonProperty("billing_address") BillingAddress billingAddress
) {
    public record BillingAddress(
            @JsonProperty("email_address") String emailAddress,
            @JsonProperty("phone_number") String phoneNumber,
            @JsonProperty("country_code") String countryCode,
            @JsonProperty("first_name") String firstName,
            @JsonProperty("last_name") String lastName,
            @JsonProperty("line_1") String line1,
            @JsonProperty("line_2") String line2,
            @JsonProperty("city") String city,
            @JsonProperty("state") String state,
            @JsonProperty("postal_code") String postalCode,
            @JsonProperty("zip_code") String zipCode
    ) {}
}