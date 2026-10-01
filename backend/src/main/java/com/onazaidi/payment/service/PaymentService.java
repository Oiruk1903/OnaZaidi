package com.onazaidi.payment.service;
import com.onazaidi.payment.event.PaymentSuccessfulEvent;

import com.onazaidi.common.constants.OrderStatus;
import com.onazaidi.common.constants.PaymentStatus;
import com.onazaidi.common.exception.BusinessException;
import com.onazaidi.common.exception.PaymentException;
import com.onazaidi.common.exception.ResourceNotFoundException;
import com.onazaidi.order.entity.Order;
import com.onazaidi.order.repository.OrderRepository;
import com.onazaidi.payment.dto.*;
import com.onazaidi.payment.entity.Payment;
import com.onazaidi.payment.entity.PaymentWebhook;
import com.onazaidi.payment.provider.PaymentProvider;
import com.onazaidi.payment.provider.PaymentProviderFactory;
import com.onazaidi.payment.repository.PaymentRepository;
import com.onazaidi.payment.repository.PaymentWebhookRepository;
import com.onazaidi.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentWebhookRepository webhookRepository;
    private final OrderRepository orderRepository;
    private final PaymentProviderFactory providerFactory;
    private final ApplicationEventPublisher events;

    @Value("${payment.callback-base-url:http://localhost:5173}")
    private String callbackBaseUrl;

    @Transactional
    public InitiatePaymentClientResponse initiate(InitiatePaymentRequest req) {
        Order order = orderRepository.findByOrderNumber(req.orderNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found."));

        if (!order.getCustomer().getId().equals(CurrentUser.id())) {
            throw new ResourceNotFoundException("Order not found.");
        }

        if (order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.FULFILLED) {
            throw new BusinessException("ORDER_ALREADY_PAID", "This order is already paid.");
        }

        PaymentProvider provider = providerFactory.get(req.provider());

        // Create the Payment row first so a webhook can always find it.
        Payment payment = Payment.builder()
                .order(order)
                .provider(provider.getName())
                .amount(order.getTotalAmount())
                .currency(order.getCurrency())
                .status(PaymentStatus.INITIATED)
                .idempotencyKey(order.getOrderNumber() + ":" + provider.getName())
                .build();
        payment = paymentRepository.save(payment);

        String callback = callbackBaseUrl + "/payment/callback?provider=" +
                provider.getName() + "&orderNumber=" + order.getOrderNumber();

        PaymentInitRequest initReq = new PaymentInitRequest(
                order.getId(),
                order.getOrderNumber(),
                order.getTotalAmount(),
                order.getCurrency(),
                order.getCustomerEmail(),
                order.getCustomerName(),
                null,
                "OnaZaidi order " + order.getOrderNumber(),
                callback,
                payment.getIdempotencyKey()
        );

        InitiatePaymentResponse initRes = provider.initiate(initReq);

        payment.setProviderPaymentId(initRes.providerPaymentId());
        payment.setRawInitResponse(safeJson(initRes));
        payment.setStatus(PaymentStatus.PENDING);
        paymentRepository.save(payment);

        // Move order into PAYMENT_PENDING (allowed from CREATED)
        if (order.getStatus() == OrderStatus.CREATED) {
            order.transitionTo(OrderStatus.PAYMENT_PENDING);
            orderRepository.save(order);
        }

        return new InitiatePaymentClientResponse(
                payment.getId().toString(),
                provider.getName(),
                initRes.redirectUrl(),
                payment.getStatus().name()
        );
    }

    /**
     * Reconcile with the provider — used both by the callback page and by webhooks.
     * This is the ONLY method that should ever mark an order as PAID.
     */
    @Transactional
    public Payment markPaidIfConfirmed(UUID paymentId, String providerName, String providerPaymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found."));

        if (payment.getStatus() == PaymentStatus.PAID) {
            return payment;   // idempotent
        }

        PaymentProvider provider = providerFactory.get(providerName);
        PaymentStatusResult result = provider.verify(providerPaymentId);

        if (!"PAID".equals(result.status())) {
            payment.setRawVerifyResponse(safeJson(result));
            payment.setStatus(PaymentStatus.valueOf(result.status()));
            paymentRepository.save(payment);
            return payment;
        }

        // Verify the amount matches what we expected — do NOT trust the browser.
        BigDecimal expected = payment.getAmount();
        if (result.amount() != null && expected != null
                && result.amount().compareTo(expected) != 0) {
            log.error("Payment amount mismatch for {}: expected {}, got {}",
                    payment.getId(), expected, result.amount());
            throw new PaymentException("Payment amount mismatch");
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(Instant.now());
        payment.setRawVerifyResponse(safeJson(result));
        payment = paymentRepository.save(payment);

        Order order = payment.getOrder();
        if (order.getStatus() == OrderStatus.PAYMENT_PENDING
                || order.getStatus() == OrderStatus.CREATED) {
            order.transitionTo(OrderStatus.PAID);
            orderRepository.save(order);
        }

        events.publishEvent(new PaymentSuccessfulEvent(payment.getId(), order.getId()));

        return payment;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordWebhook(String provider, WebhookResult result, String rawPayload) {
        if (webhookRepository.existsByProviderAndEventId(provider, result.eventId())) {
            log.debug("Duplicate webhook ignored: {} / {}", provider, result.eventId());
            return;
        }

        PaymentWebhook wh = PaymentWebhook.builder()
                .provider(provider)
                .eventId(result.eventId())
                .eventType(result.eventType())
                .payload(rawPayload)
                .signatureValid(result.signatureValid())
                .processed(false)
                .build();
        webhookRepository.save(wh);
    }

    @Transactional
    public void processWebhook(String providerName, WebhookResult result) {
        PaymentProvider provider = providerFactory.get(providerName);

        // Find the local payment using the provider payment id.
        Payment payment = paymentRepository
                .findByProviderAndProviderPaymentId(providerName, result.providerPaymentId())
                .orElse(null);

        if (payment == null) {
            log.warn("Webhook for unknown payment: {} / {}",
                    providerName, result.providerPaymentId());
            return;
        }

        markPaidIfConfirmed(payment.getId(), providerName, result.providerPaymentId());
    }

    public List<PaymentResponse> listPaymentsForOrder(UUID orderId) {
        return paymentRepository.findAllByOrderIdOrderByCreatedAtDesc(orderId)
                .stream().map(this::toResponse).toList();
    }

    public PaymentResponse toResponse(Payment p) {
        return new PaymentResponse(
                p.getId(), p.getProvider(), p.getProviderPaymentId(),
                p.getAmount(), p.getCurrency(), p.getStatus().name(),
                p.getPaidAt(), p.getCreatedAt()
        );
    }

    private String safeJson(Object o) {
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(o);
        } catch (Exception e) {
            return "{}";
        }
    }
}