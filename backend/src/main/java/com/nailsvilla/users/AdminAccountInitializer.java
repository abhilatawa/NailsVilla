package com.nailsvilla.users;

import java.time.Clock;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Makes sure the salon owner has an admin login. Configured with the ADMIN_EMAIL and
 * ADMIN_PASSWORD environment variables; does nothing when either is unset.
 *
 * <ul>
 *   <li>No account with that email → an ADMIN account is created with that password.</li>
 *   <li>A customer account already uses that email → it is promoted to ADMIN.</li>
 *   <li>The account is already an admin → left untouched.</li>
 * </ul>
 * An existing account's password is never overwritten, so changing ADMIN_PASSWORD later
 * has no effect — use the forgot-password flow instead.
 */
@Component
public class AdminAccountInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminAccountInitializer.class);
    private static final int MIN_PASSWORD_LENGTH = 8;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;
    private final String adminEmail;
    private final String adminPassword;

    public AdminAccountInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            Clock clock,
            @Value("${nailsvilla.admin.email:}") String adminEmail,
            @Value("${nailsvilla.admin.password:}") String adminPassword
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
        this.adminEmail = adminEmail.trim();
        this.adminPassword = adminPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (adminEmail.isEmpty() || adminPassword.isEmpty()) {
            return;
        }

        Instant now = clock.instant();
        userRepository.findByEmailIgnoreCase(adminEmail).ifPresentOrElse(
                existing -> {
                    if (existing.getRole() != Role.ADMIN) {
                        existing.setRole(Role.ADMIN);
                        existing.setUpdatedAt(now);
                        log.info("Promoted existing account to admin");
                    }
                },
                () -> {
                    if (adminPassword.length() < MIN_PASSWORD_LENGTH) {
                        log.warn("ADMIN_PASSWORD must be at least {} characters; admin account not created", MIN_PASSWORD_LENGTH);
                        return;
                    }
                    User admin = new User();
                    admin.setEmail(adminEmail);
                    admin.setPasswordHash(passwordEncoder.encode(adminPassword));
                    admin.setFirstName("Salon");
                    admin.setLastName("Admin");
                    admin.setRole(Role.ADMIN);
                    admin.setStatus(UserStatus.ACTIVE);
                    admin.setCreatedAt(now);
                    admin.setUpdatedAt(now);
                    userRepository.save(admin);
                    log.info("Created admin account");
                });
    }
}
