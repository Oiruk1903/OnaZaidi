package com.onazaidi.payment.controller;

import com.onazaidi.common.api.ApiResponse;
import com.onazaidi.payment.dto.PaymentResponse;
import com.onazaidi.payment.repository.PaymentRepository;
import com.onazaidi.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;

    @GetMapping
    public ApiResponse<List<PaymentResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<com.onazaidi.payment.entity.Payment> p = paymentRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ApiResponse.ok(p.getContent().stream()
                .map(paymentService::toResponse).toList());
    }
}