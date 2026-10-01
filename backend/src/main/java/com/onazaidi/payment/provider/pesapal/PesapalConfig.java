package com.onazaidi.payment.provider.pesapal;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Getter
@Component
public class PesapalConfig {

    @Value("${payment.pesapal.enabled:false}")
    private boolean enabled;

    @Value("${payment.pesapal.base-url:https://cybqa.pesapal.com/pesapalv3}")
    private String baseUrl;

    @Value("${payment.pesapal.consumer-key:}")
    private String consumerKey;

    @Value("${payment.pesapal.consumer-secret:}")
    private String consumerSecret;

    @Value("${payment.pesapal.callback-url:}")
    private String callbackUrl;

    @Value("${payment.pesapal.ipn-url:}")
    private String ipnUrl;

    /**
     * The IPN ID returned by Pesapal when you register your IPN URL.
     * You register once per environment and then reuse it for every order.
     * Can also be fetched at runtime if empty — see PesapalProvider.
     */
    @Value("${payment.pesapal.ipn-id:}")
    private String ipnId;
}