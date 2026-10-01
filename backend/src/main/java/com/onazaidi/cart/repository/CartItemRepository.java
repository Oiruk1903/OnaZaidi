package com.onazaidi.cart.repository;

import com.onazaidi.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    Optional<CartItem> findByCartIdAndPhotoId(UUID cartId, UUID photoId);
}