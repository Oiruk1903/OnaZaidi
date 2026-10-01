package com.onazaidi.user.service;

import com.onazaidi.common.api.PageResponse;
import com.onazaidi.common.exception.BusinessException;
import com.onazaidi.common.exception.ResourceNotFoundException;
import com.onazaidi.security.CurrentUser;
import com.onazaidi.user.dto.AdminUserResponse;
import com.onazaidi.user.dto.ChangePasswordRequest;
import com.onazaidi.user.dto.UpdateProfileRequest;
import com.onazaidi.user.dto.UserResponse;
import com.onazaidi.user.entity.Role;
import com.onazaidi.user.entity.User;
import com.onazaidi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getCurrentUser() {
        return toResponse(getById(CurrentUser.id()));
    }

    public User getById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest req) {
        User user = getById(CurrentUser.id());
        if (req.firstName() != null) user.setFirstName(req.firstName());
        if (req.lastName() != null) user.setLastName(req.lastName());
        if (req.phone() != null) user.setPhone(req.phone());
        if (req.countryCode() != null) user.setCountryCode(req.countryCode());
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(ChangePasswordRequest req) {
        User user = getById(CurrentUser.id());
        if (!passwordEncoder.matches(req.currentPassword(), user.getPasswordHash())) {
            throw new BusinessException("INVALID_PASSWORD", "Current password is incorrect.");
        }
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
    }

    public UserResponse toResponse(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getCountryCode(),
                user.getStatus(),
                user.isEmailVerified(),
                roles,
                user.getCreatedAt()
        );
    }

    public PageResponse<AdminUserResponse> listAllUsers(String search, String role, String status, int page, int size) {
        Specification<User> spec = Specification.where(null);

        if (search != null && !search.isBlank()) {
            spec = spec.and((root, query, cb) ->
                cb.or(
                    cb.like(cb.lower(root.get("email")), "%" + search.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("firstName")), "%" + search.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("lastName")), "%" + search.toLowerCase() + "%")
                )
            );
        }

        if (role != null && !role.isBlank()) {
            spec = spec.and((root, query, cb) ->
                cb.equal(root.join("roles").get("name"), role)
            );
        }

        if (status != null && !status.isBlank()) {
            spec = spec.and((root, query, cb) ->
                cb.equal(root.get("status"), status)
            );
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> userPage = userRepository.findAll(spec, pageable);

        return new PageResponse<>(
            userPage.getContent().stream().map(this::toAdminResponse).collect(Collectors.toList()),
            userPage.getNumber(),
            userPage.getSize(),
            userPage.getTotalElements(),
            userPage.getTotalPages(),
            userPage.isLast()
        );
    }

    public AdminUserResponse getUserById(String id) {
        User user = userRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        return toAdminResponse(user);
    }

    private AdminUserResponse toAdminResponse(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return new AdminUserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getCountryCode(),
                user.getStatus(),
                user.isEmailVerified(),
                roles,
                user.getCreatedAt()
        );
    }
}