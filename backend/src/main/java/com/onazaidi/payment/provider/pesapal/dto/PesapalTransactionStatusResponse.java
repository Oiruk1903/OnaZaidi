package com.onazaidi.payment.provider.pesapal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PesapalTransactionStatusResponse(
        @JsonProperty("payment_method") String paymentMethod,
        Double amount,
        @JsonProperty("created_date") String createdDate,
        @JsonProperty("confirmation_code") String confirmationCode,
        @JsonProperty("payment_status_description") String paymentStatusDescription,
        String description,
        @JsonProperty("message") String message,
        @JsonProperty("payment_account") String paymentAccount,
        @JsonProperty("call_back_url") String callBackUrl,
        @JsonProperty("status_code") String statusCode,
        @JsonProperty("merchant_reference") String merchantReference,
        @JsonProperty("payment_status_code") String paymentStatusCode,
        String currency,
        String error
) {}