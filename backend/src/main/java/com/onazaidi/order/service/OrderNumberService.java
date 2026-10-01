package com.onazaidi.order.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Year;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderNumberService {

    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Generates order numbers of the form OZA-YYYY-XXXXXXXX where XXXXXXXX is
     * a base-36 random suffix. Collision probability across a year is
     * negligible; the DB UNIQUE constraint is the last line of defense.
     */
    public String next() {
        int year = Year.now().getValue();
        long value = RANDOM.nextLong(0, (long) Math.pow(36, 8));
        String suffix = Long.toString(value, 36).toUpperCase();
        suffix = "00000000".substring(suffix.length()) + suffix;
        return "OZA-" + year + "-" + suffix;
    }
}