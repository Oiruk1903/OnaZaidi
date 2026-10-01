package com.onazaidi.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String token = extractToken(request);

        if (token != null) {
            try {
                Claims claims = jwtService.parse(token);
                UUID userId = UUID.fromString(claims.getSubject());
                String email = claims.get("email", String.class);

                @SuppressWarnings("unchecked")
                Set<String> roles = Set.copyOf((List<String>) claims.get("roles", List.class));

                List<SimpleGrantedAuthority> authorities = roles.stream()
                        .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(email, null, authorities);
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                auth.setDetails(Map.of("userId", userId, "details", auth.getDetails()));

                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (Exception ex) {
                log.debug("Invalid JWT: {}", ex.getMessage());
            }
        }

        chain.doFilter(request, response);
    }

    /**
     * Read the JWT from the Authorization header, or fall back to a
     * `?token=` query parameter (used by EventSource for SSE, which
     * cannot set custom headers).
     */
    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        String queryToken = request.getParameter("token");
        return (queryToken != null && !queryToken.isBlank()) ? queryToken : null;
    }
}