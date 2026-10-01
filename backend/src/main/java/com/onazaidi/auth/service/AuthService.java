package com.onazaidi.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.onazaidi.auth.dto.AuthResponse;
import com.onazaidi.auth.dto.ForgotPasswordRequest;
import com.onazaidi.auth.dto.LoginRequest;
import com.onazaidi.auth.dto.RegisterRequest;
import com.onazaidi.auth.dto.ResetPasswordRequest;
import com.onazaidi.auth.entity.PasswordResetToken;
import com.onazaidi.auth.entity.RefreshToken;
import com.onazaidi.auth.repository.PasswordResetTokenRepository;
import com.onazaidi.auth.repository.RefreshTokenRepository;
import com.onazaidi.common.constants.RoleConstants;
import com.onazaidi.common.exception.BusinessException;
import com.onazaidi.common.exception.UnauthorizedException;
import com.onazaidi.security.JwtService;
import com.onazaidi.user.entity.Role;
import com.onazaidi.user.entity.User;
import com.onazaidi.user.repository.RoleRepository;
import com.onazaidi.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailVerificationService emailVerificationService;

    @Value("${jwt.refresh-token-expiry-ms}")
    private long refreshExpiryMs;

    @Value("${jwt.access-token-expiry-ms}")
    private long accessExpiryMs;

    @Transactional
    public AuthResponse register(RegisterRequest req, String userAgent, String ip) {
        String email = req.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException("EMAIL_IN_USE", "An account with this email already exists.");
        }

        Role customerRole = roleRepository.findByName(RoleConstants.CUSTOMER)
                .orElseThrow(() -> new BusinessException("ROLE_MISSING", "CUSTOMER role not initialised"));

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(req.password()))
                .firstName(req.firstName())
                .lastName(req.lastName())
                .phone(req.phone())
                .countryCode(req.countryCode())
                .status("ACTIVE")
                .roles(Set.of(customerRole))
                .build();

        user = userRepository.save(user);

        try {
            emailVerificationService.sendVerificationEmail(user);
        } catch (Exception e) {
            log.warn("Failed to send verification email to {}: {}", user.getEmail(), e.getMessage());
        }

        return issueTokens(user, userAgent, ip);
    }

    @Transactional
    public AuthResponse login(LoginRequest req, String userAgent, String ip) {
        User user = userRepository.findByEmailIgnoreCase(req.email().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new UnauthorizedException("Account is not active.");
        }

        return issueTokens(user, userAgent, ip);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken, String userAgent, String ip) {
        String hash = sha256(rawRefreshToken);
        RefreshToken token = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token."));

        if (!token.isUsable()) {
            throw new UnauthorizedException("Refresh token expired or revoked.");
        }

        token.setRevoked(true);
        refreshTokenRepository.save(token);

        User user = token.getUser();
        return issueTokens(user, userAgent, ip);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        String hash = sha256(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(t -> {
            t.setRevoked(true);
            refreshTokenRepository.save(t);
        });
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest req) {
        String email = req.email().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BusinessException("USER_NOT_FOUND",
                        "If an account exists with this email, a password reset link will be sent."));

        // Invalidate any existing reset tokens for this user
        passwordResetTokenRepository.findAllByUser(user).forEach(token -> {
            token.setUsedAt(Instant.now());
            passwordResetTokenRepository.save(token);
        });

        // Raw token goes in the email; only its hash is stored in the DB.
        String rawToken = randomToken();
        String hash = sha256(rawToken);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .tokenHash(hash)
                .expiresAt(Instant.now().plusMillis(3600000)) // 1 hour
                .build();
        passwordResetTokenRepository.save(resetToken);

        try {
            sendPasswordResetEmail(user, rawToken);
            log.info("Password reset email sent to {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", email, e.getMessage());
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        String hash = sha256(req.token());
        PasswordResetToken token = passwordResetTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new BusinessException("INVALID_TOKEN",
                        "Invalid or expired reset token."));

        if (!token.isValid()) {
            throw new BusinessException("INVALID_TOKEN", "Invalid or expired reset token.");
        }

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);

        token.setUsedAt(Instant.now());
        passwordResetTokenRepository.save(token);

        log.info("Password reset for user {}", user.getEmail());
    }

    private void sendPasswordResetEmail(User user, String rawToken) {
        String resetUrl = "https://yourdomain.com/reset-password?token=" + rawToken;
        log.info("Password reset link for {}: {}", user.getEmail(), resetUrl);
        // TODO: wire actual email service (Resend / SES)
    }

    private AuthResponse issueTokens(User user, String userAgent, String ip) {
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), roles);

        String rawRefreshToken = randomToken();
        String hashed = sha256(rawRefreshToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(hashed)
                .expiresAt(Instant.now().plusMillis(refreshExpiryMs))
                .userAgent(userAgent)
                .ipAddress(ip)
                .build();
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                accessToken,
                rawRefreshToken,
                accessExpiryMs / 1000,
                new AuthResponse.UserSummary(
                        user.getId().toString(),
                        user.getEmail(),
                        user.getFirstName(),
                        user.getLastName(),
                        roles
                )
        );
    }

    private String randomToken() {
        byte[] bytes = new byte[64];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }
}