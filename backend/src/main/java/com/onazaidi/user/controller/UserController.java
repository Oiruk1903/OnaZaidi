package com.onazaidi.user.controller;

import com.onazaidi.common.api.ApiResponse;
import com.onazaidi.user.dto.ChangePasswordRequest;
import com.onazaidi.user.dto.UpdateProfileRequest;
import com.onazaidi.user.dto.UserResponse;
import com.onazaidi.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ApiResponse<UserResponse> me() {
        return ApiResponse.ok(userService.getCurrentUser());
    }

    @PatchMapping
    public ApiResponse<UserResponse> update(@Valid @RequestBody UpdateProfileRequest req) {
        return ApiResponse.ok(userService.updateProfile(req));
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest req) {
        userService.changePassword(req);
        return ApiResponse.ok(null, "Password changed.");
    }
}