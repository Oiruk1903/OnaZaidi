package com.onazaidi.security;

import com.onazaidi.common.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class CurrentUser {

    private CurrentUser() {}

    public static UUID id() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new UnauthorizedException("Not authenticated");
        }
        Object details = auth.getDetails();
        if (details instanceof java.util.Map<?,?> map && map.get("userId") instanceof UUID id) {
            return id;
        }
        throw new UnauthorizedException("User id not available in token");
    }

    public static boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}