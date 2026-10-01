package com.onazaidi.order.controller;

import com.onazaidi.common.api.ApiResponse;
import com.onazaidi.common.api.PageResponse;
import com.onazaidi.common.constants.OrderStatus;
import com.onazaidi.order.dto.OrderFilterRequest;
import com.onazaidi.order.dto.OrderResponse;
import com.onazaidi.order.dto.OrderSummaryResponse;
import com.onazaidi.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ApiResponse<PageResponse<OrderSummaryResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        OrderFilterRequest filter = new OrderFilterRequest(search, status, customerId, from, to);
        return ApiResponse.ok(orderService.listAllOrders(filter, page, size));
    }

    @GetMapping("/{orderNumber}")
    public ApiResponse<OrderResponse> get(@PathVariable String orderNumber) {
        return ApiResponse.ok(orderService.getByOrderNumber(orderNumber, true));
    }

    @PostMapping("/{id}/status")
    public ApiResponse<Void> changeStatus(@PathVariable UUID id,
                                          @RequestParam OrderStatus status) {
        orderService.transitionStatus(id, status);
        return ApiResponse.ok(null, "Order status updated.");
    }
}