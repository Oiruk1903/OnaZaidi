package com.onazaidi.payment.repository;

import com.onazaidi.payment.entity.PaymentWebhook;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentWebhookRepository extends JpaRepository<PaymentWebhook, UUID> {
    Optional<PaymentWebhook> findByProviderAndEventId(String provider, String eventId);
    boolean existsByProviderAndEventId(String provider, String eventId);
}