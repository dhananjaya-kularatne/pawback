# Deployment and recovery

## Configuration

Run the backend with `SPRING_PROFILES_ACTIVE=prod`. Supply all provider secrets from the hosting environment, never from tracked files.

| Variable | Production value |
| --- | --- |
| DB_URL | JDBC URL for the intended existing MySQL schema, using appropriate transport protection for remote DB connections |
| DB_USERNAME / DB_PASSWORD | Runtime identity with SELECT, INSERT, UPDATE, DELETE on this schema |
| DB_MIGRATION_USERNAME / DB_MIGRATION_PASSWORD | Separate migration identity with schema-changing privileges |
| JWT_SECRET | Random secret containing at least 64 bytes; keep stable across instances/restarts |
| FRONTEND_URL | Public HTTPS frontend origin, without a path or trailing slash |
| BACKEND_PUBLIC_URL | Public HTTPS backend/proxy origin, without a path or trailing slash |
| OAUTH_REDIRECT_URI | FRONTEND_URL followed by `/oauth2/redirect` |
| CORS_ALLOWED_ORIGINS | Comma-separated exact HTTPS frontend origins |
| GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET | Credentials whose authorized redirect matches BACKEND_PUBLIC_URL followed by `/login/oauth2/code/google` |
| CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET | Image-provider account credentials |
| BREVO_API_KEY / BREVO_SENDER_EMAIL | Mail API key and verified sender; optional BREVO_SENDER_NAME |
| PORT | Backend listening port; default 8080 |
| TRUSTED_PROXY_IPS | Empty for direct connections, or exact immediate edge proxy peer IPs; see below |

The production profile rejects non-HTTPS public origins, mismatched callbacks, short JWT secrets, and missing mail/image settings. It does not verify account ownership or contact external providers; live provider checks remain necessary. Default request threads/pool sizes are 20/30 so staging transactions have spare DB connections. If tuning these, retain at least three pool connections beyond request threads and account for additional scheduled work. Do not turn on unbounded virtual request threads without reviewing pool capacity.

Build the frontend with `VITE_API_BASE_URL=/api` for a same-origin proxy and a real `VITE_SUPPORT_EMAIL` if support contact is available. Only frontend-public settings belong in Vite variables; never place secrets there.

## Web server and HTTPS

Build the frontend and serve `frontend/dist`. An example private HTTP listener behind your platform's HTTPS termination is in `deploy/nginx.conf.example`. Public access must use HTTPS. Proxy `/api/`, `/oauth2/`, and `/login/oauth2/` to the backend, preserve Authorization, and use an SPA fallback for other routes. Keep the backend and DB inaccessible from untrusted direct connections when using a trusted proxy configuration.

The report limiter ignores X-Forwarded-For from untrusted peers. When trusting an edge, configure it to **replace** that header with the real immediate client address and put only that edge's peer IP in TRUSTED_PROXY_IPS. Chains with multiple proxies require an explicitly reviewed edge configuration. Login rate limiting has a separate implementation and remains a release gate listed in RELEASE.md.

Set proxy/body limits to allow a 5 MiB image plus multipart overhead; the supplied example uses 6 MiB. Validate `/api/health`, a browser refresh of `/dashboard`, `/scan/<uuid>`, `/help`, and the OAuth callback after deployment. Run one real phone scan, one supported image upload, and one provider email check using disposable records.

## Existing database upgrade

1. Stop application writes and take a verified backup. Confirm DB_URL points to the intended schema. Record user/pet/report counts and representative pet UUIDs.
2. For a Hibernate-era schema without Flyway history, set `FLYWAY_BASELINE_ON_MIGRATE=true` for the first migrated start only. The baseline version is deliberately **0**, allowing V1's create-if-missing statements and the additive V2/V3 changes to run. Do not baseline an unrelated schema.
3. Start the new backend. Flyway applies migrations, then Hibernate validates mapped columns. Confirm `flyway_schema_history` has successful migrations and compare the recorded counts/UUIDs.
4. Unset the baseline flag. Subsequent starts use recorded history and checksum validation. Do not enable automatic Hibernate schema updates in production.

Migrations use Spring Boot's [Flyway integration](https://docs.spring.io/spring-boot/how-to/data-initialization.html), including MySQL support. MySQL DDL may not roll back as a transaction: if a migration fails, stop and inspect it against the backup; do not blindly repair history or drop tables. Revert application code only when it is compatible with the migrated schema, otherwise restore the tested backup.

## Initial administrator

Register the intended account through the app. Using an operator DB session, verify the account's ID/email, then promote that exact record:

```sql
SELECT id, email, role, enabled FROM users WHERE email = 'your-verified-account@example.com';
UPDATE users SET role = 'ADMIN' WHERE id = 123 AND email = 'your-verified-account@example.com' AND enabled = 1;
```

Confirm exactly one row changed. Sign out/in to refresh the displayed role. Ordinary registration always creates OWNER accounts. There is no public admin-creation endpoint or default admin password.

## Backup and restore

Use the MySQL client's interactive password prompt or your hosting secret facility. Store backups outside the repository with access restricted to the service operator. For transactional tables:

```text
mysqldump --user=pawback_backup --password --single-transaction --routines --triggers --hex-blob --result-file=pawback-backup.sql pawback
mysql --user=pawback_restore --password pawback_restore
```

In the restore session, use `SOURCE /absolute/path/pawback-backup.sql;`. Restore into a **new isolated schema**, not over the only live copy. Point a disposable backend at it, allow Flyway to validate/apply pending migrations, then compare row counts, binary pet UUIDs, owner access, reports, and soft-deleted visibility. Keep provider credentials disabled/mocked during restore drills so queued jobs cannot remove real cloud assets or send mail. Only switch live traffic after these checks pass. Define and operate backup retention separately from app deletion.

## Asset recovery and removal

Every new upload is assigned a public ID and a recovery row before the cloud call. The row is removed only in the DB transaction that attaches the asset. A failed/interrupted operation leaves a recovery job due after one hour. Replaced or removed assets are queued immediately. The scheduler processes up to 50 due jobs per minute, verifies that no live pet/report still references the asset, and retries failures with capped backoff. Multiple instances lock jobs before processing.

Inspect pending work without exposing credentials:

```sql
SELECT public_id, attempts, next_attempt_at FROM asset_cleanup_tasks ORDER BY next_attempt_at LIMIT 50;
```

Do not delete these rows to hide provider errors. Fix provider access and allow retry. Set `app.asset-cleanup.enabled=false` only during a controlled recovery/restore drill; re-enable it afterwards. Legacy public IDs are derived only from this Cloudinary account's managed PawBack folders. Unknown external URLs are never sent for deletion.

Pet removal hides the profile, disables QR lookup, deletes its reports, and queues associated assets; the pet row remains internally soft-deleted. There is no restore button. If a domain changes, regenerate affected QR images and replace physical printed tags; an image update cannot rewrite an already printed localhost URL.
