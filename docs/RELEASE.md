# Local verification checklist

Backend unit tests and CI are excluded from the agreed scope. This checklist covers code completion and manual integration checks. Deployment preparation is deferred.

## Application checks

- Build the backend with Java 21 and skipped tests; clean-install, lint, and build the frontend.
- Verify Hibernate startup against fresh and existing schemas, and an isolated backup/restore drill.
- Sign in/out, refresh a valid session, leave it open until expiry, disable a disposable account, and distinguish 401 from role/ownership 403 responses.
- Register/edit a pet; reject empty, spoofed, oversized, and over-dimension images; validate text and coordinate limits.
- Simulate photo/QR/provider/DB failures. Confirm no partial pet or duplicate successful retry, durable cleanup, retry after deletion failure, and protection of referenced assets.
- Use another owner account to verify private report and removal authorization. Remove a disposable pet and verify its public QR URL returns 404 and history/assets are removed as designed.
- Check report replay, per-client/per-pet limits, concurrent requests, expired budget cleanup, and ignored untrusted forwarding headers.
- Read reports with/without images/location; apply unchanged filters repeatedly; delete the last report on the last page.
- Use keyboard-only navigation and short 320px screens for add/edit/crop/auth/report/QR/confirmation dialogs. Verify preview URLs are released on close.
- Verify support/help/data links, browser title, unknown-route handling, deep-link refresh, and QR regeneration.

## Authentication and email follow-up

The original backend authentication/email audit items are addressed by PAW-55 through PAW-59: server-side OAuth state, verified provider identities, safe failure redirects, browser-bound one-use exchange codes, shared request/verification limits, reset token-version revocation, escaped email content, and encrypted persistent delivery jobs. The frontend callback and field-feedback checks are complete. See [AUTHENTICATION.md](AUTHENTICATION.md) for behavior, local configuration, and limitations.

A live Google sign-in with another eligible account reached the dashboard on 18 November 2026, confirmed during the guided check. Inbox delivery and physical phone scanning still require their own confirmation. Deployment work will be planned separately.
