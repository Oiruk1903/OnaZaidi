package com.onazaidi.payment.repository;

import com.onazaidi.common.constants.PaymentStatus;
import com.onazaidi.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByProviderAndProviderPaymentId(String provider, String providerPaymentId);

    List<Payment> findAllByOrderIdOrderByCreatedAtDesc(UUID orderId);

    Optional<Payment> findFirstByOrderIdAndStatusOrderByCreatedAtDesc(UUID orderId, PaymentStatus status);
}