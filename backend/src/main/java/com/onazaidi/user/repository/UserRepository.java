package com.onazaidi.user.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.onazaidi.user.entity.User;

public interface UserRepository extends JpaRepository<User, UUID>,
        JpaSpecificationExecutor<User> {

    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);

    Page<User> findAllByRoles_Name(String roleName, Pageable pageable);
}