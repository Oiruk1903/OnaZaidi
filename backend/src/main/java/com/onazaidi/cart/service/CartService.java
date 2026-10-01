package com.onazaidi.cart.service;

import com.onazaidi.cart.dto.AddCartItemRequest;
import com.onazaidi.cart.dto.CartItemResponse;
import com.onazaidi.cart.dto.CartResponse;
import com.onazaidi.cart.entity.Cart;
import com.onazaidi.cart.entity.CartItem;
import com.onazaidi.cart.repository.CartItemRepository;
import com.onazaidi.cart.repository.CartRepository;
import com.onazaidi.common.exception.BusinessException;
import com.onazaidi.common.exception.ResourceNotFoundException;
import com.onazaidi.photo.entity.Photo;
import com.onazaidi.photo.repository.PhotoRepository;
import com.onazaidi.security.CurrentUser;
import com.onazaidi.user.entity.User;
import com.onazaidi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final PhotoRepository photoRepository;
    private final UserRepository userRepository;

    @Value("${storage.public-base-url:http://localhost:9000/onazaidi-media}")
    private String publicBaseUrl;

    @Transactional
    public Cart getOrCreateCartForCurrentUser() {
        UUID userId = CurrentUser.id();
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found."));
            Cart cart = Cart.builder().user(user).build();
            return cartRepository.save(cart);
        });
    }

    @Transactional
    public CartResponse getCart() {
        Cart cart = getOrCreateCartForCurrentUser();
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(AddCartItemRequest req) {
        Cart cart = getOrCreateCartForCurrentUser();

        Photo photo = photoRepository.findById(req.photoId())
                .orElseThrow(() -> new ResourceNotFoundException("Photo not found."));

        if (!"PUBLISHED".equals(photo.getStatus())) {
            throw new BusinessException("PHOTO_NOT_AVAILABLE", "This photo is not available for purchase.");
        }

        cartItemRepository.findByCartIdAndPhotoId(cart.getId(), photo.getId()).ifPresentOrElse(
                existing -> { /* already in cart — no-op */ },
                () -> {
                    CartItem item = CartItem.builder().cart(cart).photo(photo).build();
                    cart.getItems().add(item);
                }
        );

        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(UUID photoId) {
        Cart cart = getOrCreateCartForCurrentUser();
        cart.getItems().removeIf(item -> item.getPhoto().getId().equals(photoId));
        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    public void clearCart() {
        Cart cart = getOrCreateCartForCurrentUser();
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    public CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        String currency = "USD";

        for (CartItem item : cart.getItems()) {
            Photo p = item.getPhoto();
            BigDecimal price = p.getPrice();
            subtotal = subtotal.add(price);
            currency = p.getCurrency();

            items.add(new CartItemResponse(
                    item.getId(),
                    p.getId(),
                    p.getTitle(),
                    p.getSlug(),
                    url(p.getThumbnailStorageKey()),
                    price,
                    p.getCurrency()
            ));
        }

        return new CartResponse(
                items,
                items.size(),
                subtotal,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                subtotal,
                currency
        );
    }

    private String url(String key) {
        if (key == null) return null;
        return publicBaseUrl + "/" + key;
    }
}