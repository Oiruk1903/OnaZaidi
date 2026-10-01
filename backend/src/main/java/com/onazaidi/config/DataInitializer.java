package com.onazaidi.config;

import com.onazaidi.common.constants.RoleConstants;
import com.onazaidi.user.entity.Role;
import com.onazaidi.user.entity.User;
import com.onazaidi.user.repository.RoleRepository;
import com.onazaidi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${onazaidi.bootstrap-admin.email:admin@onazaidi.com}")
    private String adminEmail;

    @Value("${onazaidi.bootstrap-admin.password:Admin12345!}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        seedRoles();
        seedAdmin();
    }

    private void seedRoles() {
        for (String name : new String[]{RoleConstants.CUSTOMER, RoleConstants.ADMIN}) {
            roleRepository.findByName(name).orElseGet(() ->
                    roleRepository.save(Role.builder().name(name).build()));
        }
    }

    private void seedAdmin() {
        if (userRepository.existsByEmailIgnoreCase(adminEmail)) return;

        Role adminRole = roleRepository.findByName(RoleConstants.ADMIN)
                .orElseThrow();

        User admin = User.builder()
                .email(adminEmail.toLowerCase())
                .passwordHash(passwordEncoder.encode(adminPassword))
                .firstName("OnaZaidi")
                .lastName("Admin")
                .status("ACTIVE")
                .emailVerifiedAt(Instant.now())
                .roles(Set.of(adminRole))
                .build();

        userRepository.save(admin);
        log.warn("Bootstrap admin created: {} (change this password!)", adminEmail);
    }
}