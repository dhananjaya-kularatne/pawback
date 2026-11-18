# Local database and recovery

Deployment preparation is deferred. These instructions cover Hibernate schema updates and recovery behavior.

Default request threads/pool sizes remain 20/30 so asset staging transactions have spare DB connections. If tuning these, retain at least three pool connections beyond request threads and account for scheduled work.

## Database schema

The backend uses `spring.jpa.hibernate.ddl-auto=update`. JPA entities describe every application table, including counters, asset cleanup, and queued mail. Hibernate creates missing tables/columns when the application starts; there is no migration history or baseline command to configure.

Back up existing data before starting changed mappings. Check the startup output for DDL failures, especially conflicting provider identity constraints. Do not delete account records or tables to make an update pass. Existing provider-identity conflicts require account review. Old reset codes from the earlier policy are rejected; request a new code.

After removing the migration dependency, run `./mvnw.cmd clean spring-boot:run` once from `backend` to clear stale compiled files. Subsequent starts can use the normal `./mvnw.cmd spring-boot:run` command.

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

In the restore session, use `SOURCE /absolute/path/pawback-backup.sql;`. Restore into a **new isolated schema**, not over the only live copy. Point a disposable backend at it, allow Hibernate to update the schema, then compare row counts, binary pet UUIDs, owner access, reports, and soft-deleted visibility. Keep provider credentials disabled/mocked during restore drills so queued jobs cannot remove real cloud assets or send mail. Only switch live traffic after these checks pass. Define and operate backup retention separately from app deletion.

## Asset recovery and removal

Every new upload is assigned a public ID and a recovery row before the cloud call. The row is removed only in the DB transaction that attaches the asset. A failed/interrupted operation leaves a recovery job due after one hour. Replaced or removed assets are queued immediately. The scheduler processes up to 50 due jobs per minute, verifies that no live pet/report still references the asset, and retries failures with capped backoff. Multiple instances lock jobs before processing.

Inspect pending work without exposing credentials:

```sql
SELECT public_id, attempts, next_attempt_at FROM asset_cleanup_tasks ORDER BY next_attempt_at LIMIT 50;
```

Do not delete these rows to hide provider errors. Fix provider access and allow retry. Set `app.asset-cleanup.enabled=false` only during a controlled recovery/restore drill; re-enable it afterwards. Legacy public IDs are derived only from this Cloudinary account's managed PawBack folders. Unknown external URLs are never sent for deletion.

Pet removal hides the profile, disables QR lookup, deletes its reports, and queues associated assets; the pet row remains internally soft-deleted. There is no restore button. If a domain changes, regenerate affected QR images and replace physical printed tags; an image update cannot rewrite an already printed localhost URL.
