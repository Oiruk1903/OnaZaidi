package com.onazaidi.cart.controller;

import com.onazaidi.cart.dto.AddCartItemRequest;
import com.onazaidi.cart.dto.CartResponse;
import com.onazaidi.cart.service.CartService;
import com.onazaidi.common.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ApiResponse<CartResponse> get() {
        return ApiResponse.ok(cartService.getCart());
    }

    @PostMapping("/items")
    public ApiResponse<CartResponse> add(@Valid @RequestBody AddCartItemRequest req) {
        return ApiResponse.ok(cartService.addItem(req), "Added to cart.");
    }

    @DeleteMapping("/items/{photoId}")
    public ApiResponse<CartResponse> remove(@PathVariable UUID photoId) {
        return ApiResponse.ok(cartService.removeItem(photoId), "Removed from cart.");
    }

    @DeleteMapping
    public ApiResponse<Void> clear() {
        cartService.clearCart();
        return ApiResponse.ok(null, "Cart cleared.");
    }
}