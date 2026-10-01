package com.onazaidi.auth.dto;

import com.onazaidi.auth.validation.StrongPassword;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 8, max = 100) @StrongPassword String newPassword
) {}