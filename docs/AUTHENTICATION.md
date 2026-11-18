# Authentication and email behavior

Deployment remains deferred. This describes the local application changes in PAW-55 through PAW-59.

## Google sign-in

Authorization requests stay in a server-side HTTP session for at most three minutes. Legacy Java-serialized cookies are ignored and removed. The session cookie is HttpOnly and SameSite=Lax; the servlet container marks it Secure on HTTPS requests. API authentication remains stateless JWT authentication.

The callback redirects to the configured frontend callback with a random 60-second, one-use code. The frontend immediately removes query credentials from browser history and exchanges the code with credentials included. The code is bound to the initiating browser session. A copied code, replay, expired code, disabled account, or password-reset version mismatch cannot issue a new session. Only the configured callback is used for success/failure; client redirect cookies and provider exception details are not trusted.

Google identities must provide a verified email and a nonempty subject. Existing Google accounts must match their original provider subject. Local accounts keep password sign-in: implicit email-only linking is rejected. Conflicting provider identities are rejected, with a database uniqueness constraint preventing concurrent duplicate identities. There is no new account-linking feature.

Use the same hostname consistently for local browser/API callbacks, such as localhost throughout. OAuth state/exchange grants live on one server instance; a future multi-instance deployment needs session affinity or shared session storage. No hosting configuration is supplied by this change.

## Passwords and reset codes

Registration and reset require eight or more characters, an uppercase letter, a number, and one of `!@#$%^&*(),.?":{}|<>`. Forms show the same policy and retain backend field errors next to inputs.

Login defaults to ten attempts per client and per account in fifteen minutes. Configurable login limits use the existing `LOGIN_RATE_LIMIT_MAX_ATTEMPTS` and `LOGIN_RATE_LIMIT_WINDOW_MINUTES` values. Password-reset requests allow five per client in fifteen minutes, three per account per hour, and one actual resend per minute. Unknown/ineligible accounts and account cooldowns use the same generic request response. Excessive client attempts return 429 with Retry-After.

Code verification and password reset share twenty client attempts and ten account attempts per fifteen minutes. Each issued code also has a maximum of five wrong guesses and a ten-minute expiry. Failed-attempt changes commit even when the API returns an invalid-code response. Row locking makes password reset one-use under concurrent requests. Replaced, exhausted, expired, or used codes cancel pending reset email.

Counters are shared in the database using HMAC identities and expire after two days. Direct callers cannot choose a bucket through X-Forwarded-For. `TRUSTED_PROXY_IPS` must remain empty locally; any future proxy boundary must replace forwarding headers and explicitly identify its immediate peer. Signup is not treated as proof that an email address is verified.

Password reset increments the account token version. Previously issued JWTs stop authenticating on the next API request. Existing versionless JWTs are accepted only while the account version remains zero. The OAuth exchange also checks its captured version. Disabled accounts are rejected for password login, Google login, exchange, and bearer API access.

## Mail queue

Set `PAWBACK_BREVO_API_KEY`, `PAWBACK_BREVO_SENDER_EMAIL`, and optionally `PAWBACK_BREVO_SENDER_NAME` in the backend process environment. A configured API key requires a sender; `app.mail.required=true` also refuses startup without complete mail configuration. These project-specific names leave another project's BREVO_API_KEY untouched. Save them as Windows User environment variables and reopen the IDE/terminal; the normal Maven command needs no extra loader. The sender still needs provider verification. With no key, jobs remain pending until configured or expired; emails are not simulated and OTPs are never logged.

Reset/report transactions write an outbox row with an AES-GCM encrypted body. Provider calls happen outside those transactions after an atomic 60-second delivery lease. Worker failures are recorded and retried with bounded backoff, up to ten attempts. Crashed leases can be reclaimed. Report jobs expire after seven days; reset jobs expire after ten minutes. Sensitive bodies are erased after acceptance, expiry, invalidation, or terminal failure. Terminal metadata is removed after thirty days. Deleted reports and disabled owners do not receive pending report jobs.

`DELIVERED` records provider acceptance, not confirmed inbox delivery. A stable provider idempotency key reduces duplicate acceptance during retries, but network ambiguity and the provider's finite idempotency window mean delivery is at least once. The finder page only promises report receipt.

Inspect status without decrypting message bodies:

```sql
SELECT id, kind, status, attempts, next_attempt_at, last_error
FROM mail_outbox ORDER BY id DESC LIMIT 50;
```

Keep the JWT secret stable while queued mail exists: it also derives the outbox encryption key. A key change invalidates JWTs and prevents decryption of earlier queued bodies. Do not log or copy decrypted OTPs during troubleshooting. Report text and pet names are HTML-escaped, and photo URLs are escaped HTTPS attributes.

## Database transition

V4 adds reset attempt counts and JWT versions; V5 adds the mail outbox. V6 invalidates earlier reset codes and adds provider-identity uniqueness. Existing accounts, pets, and reports remain. If old Google records have duplicate provider identities, V6 intentionally refuses the conflicting data; review those accounts rather than deleting or silently linking them. Never edit an already applied migration.

## Verification boundary

The disposable manual integration run covers database migrations, OAuth state/code handling, account identity policies, concurrent budgets/resets, JWT revocation, escaped/encrypted mail, outbox rollback, failure/retry, lease recovery, and expiry. Browser checks use fixture API responses for owner/admin callbacks, safe error paths, password policy, field feedback, and narrow screens. Actual Google consent and live mail delivery still require provider credentials and a verified sender. Backend unit tests, CI, and deployment configuration were not added.

Implementation references: [Spring authorization request storage](https://docs.spring.io/spring-security/reference/servlet/oauth2/client/authorization-grants.html) and [Brevo transactional email API](https://developers.brevo.com/reference/send-transac-email).
