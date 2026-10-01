package com.nailsvilla.users;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

class AdminAccountInitializerTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final Clock clock = Clock.fixed(Instant.parse("2026-10-01T12:00:00Z"), ZoneOffset.UTC);

    @Test
    void createsAdminWhenNoAccountUsesTheEmail() {
        when(userRepository.findByEmailIgnoreCase("owner@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("owner-password")).thenReturn("hashed");

        initializer("owner@example.com", "owner-password").run(null);

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(saved.capture());
        assertThat(saved.getValue().getEmail()).isEqualTo("owner@example.com");
        assertThat(saved.getValue().getPasswordHash()).isEqualTo("hashed");
        assertThat(saved.getValue().getRole()).isEqualTo(Role.ADMIN);
        assertThat(saved.getValue().getStatus()).isEqualTo(UserStatus.ACTIVE);
    }

    @Test
    void promotesExistingCustomerWithoutChangingTheirPassword() {
        User existing = new User();
        existing.setRole(Role.CUSTOMER);
        existing.setPasswordHash("original-hash");
        when(userRepository.findByEmailIgnoreCase("owner@example.com")).thenReturn(Optional.of(existing));

        initializer("owner@example.com", "owner-password").run(null);

        assertThat(existing.getRole()).isEqualTo(Role.ADMIN);
        assertThat(existing.getPasswordHash()).isEqualTo("original-hash");
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void doesNothingWhenNotConfigured() {
        initializer("", "").run(null);
        verify(userRepository, never()).findByEmailIgnoreCase(any());
    }

    @Test
    void refusesToCreateAdminWithAShortPassword() {
        when(userRepository.findByEmailIgnoreCase("owner@example.com")).thenReturn(Optional.empty());
        initializer("owner@example.com", "short").run(null);
        verify(userRepository, never()).save(any());
    }

    private AdminAccountInitializer initializer(String email, String password) {
        return new AdminAccountInitializer(userRepository, passwordEncoder, clock, email, password);
    }
}
