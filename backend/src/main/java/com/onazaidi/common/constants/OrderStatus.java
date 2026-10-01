package com.onazaidi.common.constants;

public enum OrderStatus {
    CREATED,
    PAYMENT_PENDING,
    PAID,
    FULFILLED,
    CANCELLED,
    REFUNDED,
    EXPIRED;

    public boolean canTransitionTo(OrderStatus next) {
        return switch (this) {
            case CREATED -> next == PAYMENT_PENDING || next == CANCELLED || next == EXPIRED;
            case PAYMENT_PENDING -> next == PAID || next == CANCELLED || next == EXPIRED || next == CREATED;
            case PAID -> next == FULFILLED || next == REFUNDED;
            case FULFILLED -> next == REFUNDED;
            case CANCELLED, EXPIRED, REFUNDED -> false;
        };
    }
}