package com.nailsvilla.common;

import org.springframework.http.HttpStatus;

/**
 * Base type for domain errors that should be surfaced to the client as a structured
 * {@link ApiError} rather than a generic 500. Subclasses (or direct use) supply the
 * HTTP status and a stable machine-readable code, e.g. "APPOINTMENT_UNAVAILABLE".
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    public ApiException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }
}
