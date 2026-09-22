package com.nailsvilla.settings;

/**
 * Only the fields safe to expose publicly (footer, contact page, booking review
 * screen). Excludes internal-only operational fields (minimum booking notice,
 * auto-confirm behavior) that belong to the admin-facing settings endpoint;
 * {@code cancellationWindowHours} is included because the booking review step must
 * show the cancellation policy before the customer confirms (Section 21 of the brief).
 */
public record PublicSettingsResponse(
        String salonName,
        String timezone,
        String currency,
        String city,
        String province,
        String country,
        String addressLine,
        String phone,
        String email,
        String instagramUrl,
        String facebookUrl,
        int cancellationWindowHours
) {
    static PublicSettingsResponse from(BusinessSettings settings) {
        return new PublicSettingsResponse(
                settings.getSalonName(),
                settings.getTimezone(),
                settings.getCurrency(),
                settings.getCity(),
                settings.getProvince(),
                settings.getCountry(),
                settings.getAddressLine(),
                settings.getPhone(),
                settings.getEmail(),
                settings.getInstagramUrl(),
                settings.getFacebookUrl(),
                settings.getCancellationWindowHours()
        );
    }
}
