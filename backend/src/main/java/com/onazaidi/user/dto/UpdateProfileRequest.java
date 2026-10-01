package com.onazaidi.user.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 100) String firstName,
        @Size(max = 100) String lastName,
        @Size(max = 50) String phone,
        @Size(max = 10) String countryCode
) {}