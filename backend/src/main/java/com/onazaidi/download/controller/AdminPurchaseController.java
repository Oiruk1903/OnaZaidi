package com.onazaidi.download.controller;

import com.onazaidi.common.api.ApiResponse;
import com.onazaidi.download.dto.PhotoPurchaserResponse;
import com.onazaidi.download.entity.DownloadEntitlement;
import com.onazaidi.download.repository.DownloadEntitlementRepository;
import com.onazaidi.order.entity.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/photos")
@RequiredArgsConstructor
public class AdminPurchaseController {

    private final DownloadEntitlementRepository entitlementRepository;

    @GetMapping("/{photoId}/purchasers")
    public ApiResponse<List<PhotoPurchaserResponse>> purchasers(@PathVariable UUID photoId) {
        List<DownloadEntitlement> entitlements = entitlementRepository.findAllByPhotoId(photoId);

        List<PhotoPurchaserResponse> result = entitlements.stream().map(e -> {
            Order order = e.getOrderItem().getOrder();
            BigDecimal amountPaid = e.getOrderItem().getSubtotal();

            return new PhotoPurchaserResponse(
                    e.getUser().getId(),
                    order.getCustomerName(),
                    order.getCustomerEmail(),
                    order.getOrderNumber(),
                    amountPaid,
                    order.getCurrency(),
                    e.getCreatedAt()
            );
        }).toList();

        return ApiResponse.ok(result);
    }
}
