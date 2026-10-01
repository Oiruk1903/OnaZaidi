package com.onazaidi.user.controller;

import com.onazaidi.common.api.ApiResponse;
import com.onazaidi.common.api.PageResponse;
import com.onazaidi.user.dto.AdminUserResponse;
import com.onazaidi.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ApiResponse<PageResponse<AdminUserResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok(userService.listAllUsers(search, role, status, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminUserResponse> get(@PathVariable String id) {
        return ApiResponse.ok(userService.getUserById(id));
    }
}
