package com.onazaidi.auth.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        long expiresIn,
        UserSummary user
) {
    public record UserSummary(
            String id,
            String email,
            String firstName,
            String lastName,
            java.util.Set<String> roles
    ) {}
}