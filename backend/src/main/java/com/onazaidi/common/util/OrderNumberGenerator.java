package com.onazaidi.common.util;

import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class OrderNumberGenerator {

    private static final AtomicInteger SEQ = new AtomicInteger(0);

    public String next() {
        int year = Year.now().getValue();
        int n = SEQ.incrementAndGet();
        if (n > 999999) SEQ.set(0);
        return String.format("OZA-%d-%06d", year, n);
    }
}