package com.onazaidi.order.controller;

import com.onazaidi.common.api.ApiResponse;
import com.onazaidi.common.api.PageResponse;
import com.onazaidi.order.dto.CreateOrderRequest;
import com.onazaidi.order.dto.OrderResponse;
import com.onazaidi.order.dto.OrderSummaryResponse;
import com.onazaidi.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ApiResponse<OrderResponse> create(@Valid @RequestBody CreateOrderRequest req) {
        return ApiResponse.ok(orderService.createFromCart(req), "Order created.");
    }

    @GetMapping("/{orderNumber}")
    public ApiResponse<OrderResponse> get(@PathVariable String orderNumber) {
        return ApiResponse.ok(orderService.getByOrderNumber(orderNumber, false));
    }

    @GetMapping
    public ApiResponse<PageResponse<OrderSummaryResponse>> myOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(orderService.listMyOrders(page, size));
    }
}