package com.onazaidi.cart.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
        List<CartItemResponse> items,
        int itemCount,
        BigDecimal subtotal,
        BigDecimal discount,
        BigDecimal tax,
        BigDecimal total,
        String currency
) {}