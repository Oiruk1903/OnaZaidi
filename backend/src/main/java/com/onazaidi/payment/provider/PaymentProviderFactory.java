package com.onazaidi.payment.provider;

import com.onazaidi.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PaymentProviderFactory {

    private final List<PaymentProvider> providers;

    private Map<String, PaymentProvider> byName;

    @jakarta.annotation.PostConstruct
    void init() {
        this.byName = providers.stream()
                .collect(Collectors.toMap(PaymentProvider::getName, Function.identity()));
    }

    public PaymentProvider get(String name) {
        PaymentProvider p = byName.get(name.toLowerCase());
        if (p == null) {
            throw new BusinessException("UNKNOWN_PROVIDER", "Unknown payment provider: " + name);
        }
        if (!p.isEnabled()) {
            throw new BusinessException("PROVIDER_DISABLED", "Payment provider is not enabled: " + name);
        }
        return p;
    }

    public List<String> enabledNames() {
        return providers.stream().filter(PaymentProvider::isEnabled)
                .map(PaymentProvider::getName).toList();
    }
}