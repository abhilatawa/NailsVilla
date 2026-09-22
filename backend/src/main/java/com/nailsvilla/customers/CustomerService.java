package com.nailsvilla.customers;

import com.nailsvilla.users.User;
import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final Clock clock;

    public CustomerService(CustomerRepository customerRepository, Clock clock) {
        this.customerRepository = customerRepository;
        this.clock = clock;
    }

    /** Finds the customer profile linked to this account, creating one on first booking. */
    @Transactional
    public Customer getOrCreateForUser(User user) {
        return customerRepository.findByUserId(user.getId()).orElseGet(() -> {
            Customer customer = new Customer();
            customer.setUserId(user.getId());
            customer.setFirstName(user.getFirstName());
            customer.setLastName(user.getLastName());
            customer.setEmail(user.getEmail());
            customer.setPhone(user.getPhone() != null ? user.getPhone() : "");
            Instant now = clock.instant();
            customer.setCreatedAt(now);
            customer.setUpdatedAt(now);
            return customerRepository.save(customer);
        });
    }

    /**
     * Finds or creates a guest customer profile (no linked account) keyed by email, so
     * repeat guest bookings under the same email reuse one profile instead of piling up
     * duplicate rows.
     */
    @Transactional
    public Customer getOrCreateGuest(String firstName, String lastName, String email, String phone) {
        return customerRepository.findByEmailIgnoreCaseAndUserIdIsNull(email)
                .map(existing -> {
                    existing.setFirstName(firstName);
                    existing.setLastName(lastName);
                    existing.setPhone(phone);
                    existing.setUpdatedAt(clock.instant());
                    return existing;
                })
                .orElseGet(() -> {
                    Customer customer = new Customer();
                    customer.setFirstName(firstName);
                    customer.setLastName(lastName);
                    customer.setEmail(email);
                    customer.setPhone(phone);
                    Instant now = clock.instant();
                    customer.setCreatedAt(now);
                    customer.setUpdatedAt(now);
                    return customerRepository.save(customer);
                });
    }

    @Transactional(readOnly = true)
    public Optional<Customer> findByUserId(UUID userId) {
        return customerRepository.findByUserId(userId);
    }
}
