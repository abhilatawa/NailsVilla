package com.nailsvilla.security;

import com.nailsvilla.users.User;
import com.nailsvilla.users.UserRepository;
import com.nailsvilla.users.UserStatus;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import java.util.UUID;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Reads an optional {@code Authorization: Bearer <token>} header. A missing or invalid
 * token is not an error here — it just leaves the request unauthenticated, so public
 * endpoints (and endpoints like appointment creation that accept both guests and
 * logged-in customers) keep working; {@code SecurityConfig} is what actually enforces
 * which endpoints require authentication.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        extractToken(request)
                .flatMap(jwtService::parse)
                .flatMap(claims -> loadActiveUser(claims.userId()))
                .ifPresent(user -> {
                    SecurityUser principal = new SecurityUser(user);
                    var authentication = new UsernamePasswordAuthenticationToken(
                            principal, null, principal.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                });

        filterChain.doFilter(request, response);
    }

    private Optional<String> extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return Optional.of(header.substring("Bearer ".length()));
        }
        return Optional.empty();
    }

    private Optional<User> loadActiveUser(UUID userId) {
        return userRepository.findById(userId).filter(user -> user.getStatus() == UserStatus.ACTIVE);
    }
}
