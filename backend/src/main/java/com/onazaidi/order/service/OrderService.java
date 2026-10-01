package com.onazaidi.order.service;

import com.onazaidi.cart.entity.Cart;
import com.onazaidi.cart.entity.CartItem;
import com.onazaidi.cart.repository.CartRepository;
import com.onazaidi.common.api.PageResponse;
import com.onazaidi.common.constants.OrderStatus;
import com.onazaidi.common.exception.BusinessException;
import com.onazaidi.common.exception.ResourceNotFoundException;
import com.onazaidi.order.dto.CreateOrderRequest;
import com.onazaidi.order.dto.OrderFilterRequest;
import com.onazaidi.order.dto.OrderItemResponse;
import com.onazaidi.order.dto.OrderResponse;
import com.onazaidi.order.dto.OrderSummaryResponse;
import com.onazaidi.order.entity.Order;
import com.onazaidi.order.entity.OrderItem;
import com.onazaidi.order.repository.OrderRepository;
import com.onazaidi.photo.entity.Photo;
import com.onazaidi.security.CurrentUser;
import com.onazaidi.user.entity.User;
import com.onazaidi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final ApplicationEventPublisher events;
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final OrderNumberService orderNumberService;

    @Value("${storage.public-base-url:http://localhost:9000/onazaidi-media}")
    private String publicBaseUrl;

    @Transactional
    public OrderResponse createFromCart(CreateOrderRequest req) {
        UUID userId = CurrentUser.id();

        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("EMPTY_CART", "Your cart is empty."));

        if (cart.getItems().isEmpty()) {
            throw new BusinessException("EMPTY_CART", "Your cart is empty.");
        }

        for (CartItem item : cart.getItems()) {
            Photo p = item.getPhoto();
            if (!"PUBLISHED".equals(p.getStatus())) {
                throw new BusinessException("PHOTO_UNAVAILABLE",
                        "One of the photos is no longer available: " + p.getTitle());
            }
        }

        Order order = Order.builder()
                .orderNumber(orderNumberService.next())
                .customer(customer)
                .customerEmail(req.customerEmail())
                .customerName(req.customerName())
                .currency("USD")
                .status(OrderStatus.CREATED)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            Photo p = cartItem.getPhoto();
            BigDecimal unitPrice = p.getPrice();

            OrderItem oi = OrderItem.builder()
                    .order(order)
                    .photo(p)
                    .productName(p.getTitle())
                    .unitPrice(unitPrice)
                    .quantity(1)
                    .subtotal(unitPrice)
                    .licenseType("PERSONAL")
                    .build();

            order.getItems().add(oi);
            subtotal = subtotal.add(unitPrice);
        }

        order.setSubtotal(subtotal);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setTaxAmount(BigDecimal.ZERO);
        order.setTotalAmount(subtotal);

        order = orderRepository.save(order);

        events.publishEvent(new com.onazaidi.order.event.OrderCreatedEvent(
                order.getId(),
                order.getOrderNumber(),
                order.getCustomerEmail(),
                order.getTotalAmount(),
                order.getCurrency()
        ));

        cart.getItems().clear();
        cartRepository.save(cart);

        log.info("Order created: {} for customer {}", order.getOrderNumber(), customer.getEmail());

        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getByOrderNumber(String orderNumber, boolean adminView) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found."));

        if (!adminView && !order.getCustomer().getId().equals(CurrentUser.id())) {
            throw new ResourceNotFoundException("Order not found.");
        }

        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderSummaryResponse> listMyOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<Order> orders = orderRepository
                .findAllByCustomerIdOrderByCreatedAtDesc(CurrentUser.id(), pageable);
        return PageResponse.from(orders, this::toSummary);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderSummaryResponse> listAllOrders(OrderFilterRequest filter,
                                                            int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Order> orders = orderRepository.findAll((root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (filter.status() != null && !filter.status().isBlank()) {
                try {
                    predicates.add(cb.equal(root.get("status"),
                            OrderStatus.valueOf(filter.status().toUpperCase())));
                } catch (IllegalArgumentException ignored) {}
            }
            if (filter.customerId() != null) {
                predicates.add(cb.equal(root.get("customer").get("id"), filter.customerId()));
            }
            if (filter.search() != null && !filter.search().isBlank()) {
                String like = "%" + filter.search().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("orderNumber")), like),
                        cb.like(cb.lower(root.get("customerEmail")), like),
                        cb.like(cb.lower(root.get("customerName")), like)
                ));
            }
            if (filter.from() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.from()));
            }
            if (filter.to() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filter.to()));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        }, pageable);

        return PageResponse.from(orders, this::toSummary);
    }

    @Transactional
    public void transitionStatus(UUID orderId, OrderStatus next) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found."));
        order.transitionTo(next);
        orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public Order getEntityById(UUID id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found."));
    }

    @Transactional(readOnly = true)
    public Order getEntityByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found."));
    }

    public OrderSummaryResponse toSummary(Order o) {
        return new OrderSummaryResponse(
                o.getId(),
                o.getOrderNumber(),
                o.getStatus().name(),
                o.getTotalAmount(),
                o.getCurrency(),
                o.getItems() == null ? 0 : o.getItems().size(),
                o.getCreatedAt()
        );
    }

    public OrderResponse toResponse(Order o) {
        List<OrderItemResponse> items = new ArrayList<>();
        if (o.getItems() != null) {
            for (OrderItem oi : o.getItems()) {
                Photo p = oi.getPhoto();
                items.add(new OrderItemResponse(
                        oi.getId(),
                        p.getId(),
                        oi.getProductName(),
                        p.getSlug(),
                        url(p.getThumbnailStorageKey()),
                        oi.getUnitPrice(),
                        oi.getQuantity(),
                        oi.getSubtotal()
                ));
            }
        }

        return new OrderResponse(
                o.getId(),
                o.getOrderNumber(),
                o.getCustomerName(),
                o.getCustomerEmail(),
                o.getStatus().name(),
                o.getSubtotal(),
                o.getDiscountAmount(),
                o.getTaxAmount(),
                o.getTotalAmount(),
                o.getCurrency(),
                items.size(),
                items,
                o.getCreatedAt()
        );
    }

    private String url(String key) {
        if (key == null) return null;
        return publicBaseUrl + "/" + key;
    }
}