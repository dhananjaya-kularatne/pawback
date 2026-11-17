# Local verification checklist

Backend unit tests and CI are excluded from the agreed scope. This checklist covers code completion and manual integration checks. Deployment preparation is deferred.

## Application checks

- Build the backend with Java 21 and skipped tests; clean-install, lint, and build the frontend.
- Verify fresh and legacy-schema migrations and an isolated backup/restore drill.
- Sign in/out, refresh a valid session, leave it open until expiry, disable a disposable account, and distinguish 401 from role/ownership 403 responses.
- Register/edit a pet; reject empty, spoofed, oversized, and over-dimension images; validate text and coordinate limits.
- Simulate photo/QR/provider/DB failures. Confirm no partial pet or duplicate successful retry, durable cleanup, retry after deletion failure, and protection of referenced assets.
- Use another owner account to verify private report and removal authorization. Remove a disposable pet and verify its public QR URL returns 404 and history/assets are removed as designed.
- Check report replay, per-client/per-pet limits, concurrent requests, expired budget cleanup, and ignored untrusted forwarding headers.
- Read reports with/without images/location; apply unchanged filters repeatedly; delete the last report on the last page.
- Use keyboard-only navigation and short 320px screens for add/edit/crop/auth/report/QR/confirmation dialogs. Verify preview URLs are released on close.
- Verify support/help/data links, browser title, unknown-route handling, deep-link refresh, and QR regeneration.

## Remaining backend security work

- Existing backend authentication/email audit items remain separate release gates: OAuth cookie serialization/integrity, OAuth identity linking/disabled login/redirect validation, long-lived token transport, OTP attempt protection, password-reset token revocation, login limiter trust/expiry, email HTML escaping, and durable delivery behavior. The frontend callback integration is repaired; it does not resolve these backend concerns.

Live providers and physical phone scanning remain unverified. Deployment work will be planned separately.
