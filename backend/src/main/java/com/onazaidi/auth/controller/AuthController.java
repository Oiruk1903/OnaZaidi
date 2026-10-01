package com.onazaidi.auth.controller;

import com.onazaidi.auth.dto.*;
import com.onazaidi.auth.service.AuthService;
import com.onazaidi.common.api.ApiResponse;
import com.onazaidi.user.dto.UserResponse;
import com.onazaidi.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"})
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest req,
                                              HttpServletRequest http) {
        return ApiResponse.ok(authService.register(req, ua(http), ip(http)),
                "Account created.");
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest req,
                                           HttpServletRequest http) {
        return ApiResponse.ok(authService.login(req, ua(http), ip(http)));
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest req,
                                             HttpServletRequest http) {
        return ApiResponse.ok(authService.refresh(req.refreshToken(), ua(http), ip(http)));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@Valid @RequestBody RefreshTokenRequest req) {
        authService.logout(req.refreshToken());
        return ApiResponse.ok(null, "Logged out.");
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req);
        return ApiResponse.ok(null, "If an account exists with this email, a password reset link will be sent.");
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req);
        return ApiResponse.ok(null, "Password has been reset successfully.");
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> me() {
        return ApiResponse.ok(userService.getCurrentUser());
    }

    private String ua(HttpServletRequest r) { return r.getHeader("User-Agent"); }
    private String ip(HttpServletRequest r) {
        String xff = r.getHeader("X-Forwarded-For");
        return (xff != null && !xff.isBlank()) ? xff.split(",")[0].trim() : r.getRemoteAddr();
    }
}
