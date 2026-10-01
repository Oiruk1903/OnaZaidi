package com.onazaidi.auth.dto;

import com.onazaidi.auth.validation.StrongPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 100) String firstName,
        @Size(max = 100) String lastName,
        @NotBlank @Email String email,
        @Size(max = 50) String phone,
        @Size(max = 10) String countryCode,
        @NotBlank @Size(min = 8, max = 100) @StrongPassword String password
) {}