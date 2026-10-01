package com.onazaidi.download.listener;

import com.onazaidi.download.entity.DownloadEntitlement;
import com.onazaidi.download.repository.DownloadEntitlementRepository;
import com.onazaidi.order.entity.Order;
import com.onazaidi.order.entity.OrderItem;
import com.onazaidi.order.repository.OrderRepository;
import com.onazaidi.payment.event.PaymentSuccessfulEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentSuccessfulListener {

    private final OrderRepository orderRepository;
    private final DownloadEntitlementRepository entitlementRepository;

    @EventListener
    @Transactional
    public void onPaymentSuccessful(PaymentSuccessfulEvent event) {
        Order order = orderRepository.findById(event.orderId())
                .orElseThrow(() -> new IllegalStateException(
                        "Order not found for payment event: " + event.orderId()));

        for (OrderItem item : order.getItems()) {
            // Idempotency: skip if an entitlement already exists for this item.
            if (entitlementRepository.findByOrderItemId(item.getId()).isPresent()) {
                continue;
            }
            DownloadEntitlement entitlement = DownloadEntitlement.builder()
                    .user(order.getCustomer())
                    .orderItem(item)
                    .photo(item.getPhoto())
                    .status("ACTIVE")
                    .downloadCount(0)
                    .maxDownloads(10)
                    .build();
            entitlementRepository.save(entitlement);

            log.info("Created download entitlement for user {} / photo {}",
                    order.getCustomer().getEmail(), item.getPhoto().getId());
        }
    }
}
