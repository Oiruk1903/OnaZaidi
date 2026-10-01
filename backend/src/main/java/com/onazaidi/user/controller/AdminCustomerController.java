package com.onazaidi.user.controller;

import com.onazaidi.common.api.ApiResponse;
import com.onazaidi.common.api.PageResponse;
import com.onazaidi.common.constants.RoleConstants;
import com.onazaidi.user.dto.AdminCustomerResponse;
import com.onazaidi.user.entity.User;
import com.onazaidi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/v1/admin/customers")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final UserRepository userRepository;

    @GetMapping
    public ApiResponse<PageResponse<AdminCustomerResponse>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                Math.min(size, 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));

        // Fetch all customers (usually small enough) then filter in memory.
        // Simple and safe; switch to a Specification if the list grows large.
        List<User> all = userRepository.findAllByRoles_Name(
                RoleConstants.CUSTOMER, Pageable.unpaged()).getContent();

        String needle = q == null ? null : q.trim().toLowerCase(Locale.ROOT);
        String statusFilter = (status == null || status.isBlank()) ? null : status;

        List<User> filtered = all.stream()
                .filter(u -> statusFilter == null || statusFilter.equals(u.getStatus()))
                .filter(u -> {
                    if (needle == null || needle.isEmpty()) return true;
                    String email = u.getEmail() == null ? "" : u.getEmail().toLowerCase(Locale.ROOT);
                    String first = u.getFirstName() == null ? "" : u.getFirstName().toLowerCase(Locale.ROOT);
                    String last = u.getLastName() == null ? "" : u.getLastName().toLowerCase(Locale.ROOT);
                    return email.contains(needle) || first.contains(needle) || last.contains(needle);
                })
                .toList();

        int start = Math.min(page * size, filtered.size());
        int end = Math.min(start + size, filtered.size());
        List<User> pageContent = filtered.subList(start, end);

        Page<User> pageResult = new PageImpl<>(pageContent, pageable, filtered.size());

        return ApiResponse.ok(PageResponse.from(pageResult, this::toResponse));
    }

    private AdminCustomerResponse toResponse(User u) {
        return new AdminCustomerResponse(
                u.getId(),
                u.getEmail(),
                u.getFirstName(),
                u.getLastName(),
                u.getPhone(),
                u.getCountryCode(),
                u.getStatus(),
                u.isEmailVerified(),
                u.getCreatedAt()
        );
    }
}