package com.onazaidi.payment.event;

import java.util.UUID;

public record PaymentSuccessfulEvent(UUID paymentId, UUID orderId) {}
