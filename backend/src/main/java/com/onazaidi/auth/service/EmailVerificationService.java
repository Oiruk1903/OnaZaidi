package com.onazaidi.auth.service;

import com.onazaidi.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    public void sendVerificationEmail(User user) {
        // Real implementation is added in the notification step.
        // For now: log it so local dev still works.
        log.info("[EmailVerify] Would send verification email to {}", user.getEmail());
    }
}