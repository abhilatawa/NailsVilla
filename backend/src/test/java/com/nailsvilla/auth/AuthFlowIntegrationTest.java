package com.nailsvilla.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.nailsvilla.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

class AuthFlowIntegrationTest extends AbstractIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void registerLoginRefreshAndLogoutSucceed() {
        String email = "jane.doe+%d@example.com".formatted(System.nanoTime());
        String registerBody = """
                {"firstName":"Jane","lastName":"Doe","email":"%s","password":"correct-horse-battery"}
                """.formatted(email);

        ResponseEntity<AccessTokenResponse> registerResponse = restTemplate.postForEntity(
                url("/api/v1/auth/register"), jsonEntity(registerBody), AccessTokenResponse.class);
        assertThat(registerResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(registerResponse.getBody()).isNotNull();
        assertThat(registerResponse.getBody().user().email()).isEqualToIgnoringCase(email);
        String refreshCookie = registerResponse.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        assertThat(refreshCookie).contains("refresh_token=").contains("HttpOnly");

        // Registering the same email again must fail.
        ResponseEntity<String> duplicateResponse = restTemplate.postForEntity(
                url("/api/v1/auth/register"), jsonEntity(registerBody), String.class);
        assertThat(duplicateResponse.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);

        String loginBody = """
                {"email":"%s","password":"correct-horse-battery"}
                """.formatted(email);
        ResponseEntity<AccessTokenResponse> loginResponse = restTemplate.postForEntity(
                url("/api/v1/auth/login"), jsonEntity(loginBody), AccessTokenResponse.class);
        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(loginResponse.getBody()).isNotNull();
        assertThat(loginResponse.getBody().accessToken()).isNotBlank();

        // Wrong password must be rejected.
        String wrongPasswordBody = """
                {"email":"%s","password":"totally-wrong"}
                """.formatted(email);
        ResponseEntity<String> badLoginResponse = restTemplate.postForEntity(
                url("/api/v1/auth/login"), jsonEntity(wrongPasswordBody), String.class);
        assertThat(badLoginResponse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        // Refresh using the cookie from login.
        String loginRefreshCookie = loginResponse.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        HttpHeaders refreshHeaders = new HttpHeaders();
        refreshHeaders.set(HttpHeaders.COOKIE, extractCookiePair(loginRefreshCookie));
        ResponseEntity<AccessTokenResponse> refreshResponse = restTemplate.postForEntity(
                url("/api/v1/auth/refresh"), new HttpEntity<>(null, refreshHeaders), AccessTokenResponse.class);
        assertThat(refreshResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(refreshResponse.getBody()).isNotNull();
        assertThat(refreshResponse.getBody().accessToken()).isNotBlank();

        // Logout, then the same (now-revoked) refresh token must fail.
        HttpHeaders logoutHeaders = new HttpHeaders();
        logoutHeaders.set(HttpHeaders.COOKIE, extractCookiePair(loginRefreshCookie));
        restTemplate.postForEntity(url("/api/v1/auth/logout"), new HttpEntity<>(null, logoutHeaders), Void.class);

        ResponseEntity<String> reuseAfterLogout = restTemplate.postForEntity(
                url("/api/v1/auth/refresh"), new HttpEntity<>(null, logoutHeaders), String.class);
        assertThat(reuseAfterLogout.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    private HttpEntity<String> jsonEntity(String body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        return new HttpEntity<>(body, headers);
    }

    private String extractCookiePair(String setCookieHeader) {
        return setCookieHeader.split(";", 2)[0];
    }

    private String url(String path) {
        return "http://localhost:" + port + path;
    }
}
