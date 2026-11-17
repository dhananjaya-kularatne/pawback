# Local database and recovery

Deployment preparation is deferred. These instructions cover the database migrations and recovery behavior required by the application.

Default request threads/pool sizes remain 20/30 so asset staging transactions have spare DB connections. If tuning these, retain at least three pool connections beyond request threads and account for scheduled work.

## Existing database upgrade

1. Stop application writes and take a verified backup. Confirm DB_URL points to the intended schema. Record user/pet/report counts and representative pet UUIDs.
2. For a Hibernate-era schema without Flyway history, set `FLYWAY_BASELINE_ON_MIGRATE=true` for the first migrated start only. The baseline version is deliberately **0**, allowing V1's create-if-missing statements and the additive V2/V3 changes to run. Do not baseline an unrelated schema.
3. Start the new backend. Flyway applies migrations, then Hibernate validates mapped columns. Confirm `flyway_schema_history` has successful migrations and compare the recorded counts/UUIDs.
4. Unset the baseline flag. Subsequent starts use recorded history and checksum validation. Keep Hibernate schema validation enabled.

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
