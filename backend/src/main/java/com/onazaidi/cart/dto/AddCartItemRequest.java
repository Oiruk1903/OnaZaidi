package com.onazaidi.cart.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AddCartItemRequest(@NotNull UUID photoId) {}