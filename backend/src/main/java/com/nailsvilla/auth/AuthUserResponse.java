package com.nailsvilla.auth;

import com.nailsvilla.users.Role;
import com.nailsvilla.users.User;
import java.util.UUID;

public record AuthUserResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        Role role
) {
    static AuthUserResponse from(User user) {
        return new AuthUserResponse(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getRole());
    }
}
