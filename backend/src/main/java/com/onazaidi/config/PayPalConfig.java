package com.onazaidi.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
public class PayPalConfig {

    @Value("${payment.paypal.enabled:false}")
    private boolean enabled;

    @Value("${payment.paypal.mode:sandbox}")
    private String mode;

    @Value("${payment.paypal.base-url:https://api-m.sandbox.paypal.com}")
    private String baseUrl;

    @Value("${payment.paypal.client-id:}")
    private String clientId;

    @Value("${payment.paypal.client-secret:}")
    private String clientSecret;

    @Value("${payment.paypal.return-url:}")
    private String returnUrl;

    @Value("${payment.paypal.cancel-url:}")
    private String cancelUrl;

    @Value("${payment.paypal.webhook-id:}")
    private String webhookId;
}