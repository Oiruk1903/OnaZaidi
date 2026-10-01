package com.onazaidi.payment.provider.paypal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record PayPalCreateOrderResponse(
        String id,
        String status,
        List<Link> links
) {
    public record Link(String href, String rel, String method) {}

    @JsonProperty("debug_id")
    public String debugId() { return null; } // placeholder for Jackson
}