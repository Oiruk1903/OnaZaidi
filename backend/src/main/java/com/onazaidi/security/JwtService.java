package com.onazaidi.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class JwtService {

    private final SecretKey key;
    private final long accessExpiryMs;
    private final String issuer;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiry-ms}") long accessExpiryMs,
            @Value("${jwt.issuer}") String issuer
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpiryMs = accessExpiryMs;
        this.issuer = issuer;
    }

    public String generateAccessToken(UUID userId, String email, java.util.Set<String> roles) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + accessExpiryMs);

        return Jwts.builder()
                .issuer(issuer)
                .subject(userId.toString())
                .claims(Map.of("email", email, "roles", roles))
                .issuedAt(now)
                .expiration(exp)
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parse(token).getSubject());
    }
}