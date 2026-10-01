package com.onazaidi.payment.controller;

import com.onazaidi.common.api.ApiResponse;
import com.onazaidi.payment.dto.InitiatePaymentClientResponse;
import com.onazaidi.payment.dto.InitiatePaymentRequest;
import com.onazaidi.payment.dto.PaymentResponse;
import com.onazaidi.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ApiResponse<InitiatePaymentClientResponse> initiate(
            @Valid @RequestBody InitiatePaymentRequest req) {
        return ApiResponse.ok(paymentService.initiate(req), "Payment initiated.");
    }

    @GetMapping("/order/{orderId}")
    public ApiResponse<List<PaymentResponse>> listForOrder(@PathVariable UUID orderId) {
        return ApiResponse.ok(paymentService.listPaymentsForOrder(orderId));
    }
}