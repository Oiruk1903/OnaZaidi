package com.onazaidi.order.repository;

import com.onazaidi.common.constants.OrderStatus;
import com.onazaidi.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID>,
        JpaSpecificationExecutor<Order> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Page<Order> findAllByCustomerIdOrderByCreatedAtDesc(UUID customerId, Pageable pageable);

    long countByStatus(OrderStatus status);
}