# Completion verification

Historical migration checks below describe earlier snapshots. PAW-61 removes Flyway and restores Hibernate schema updates; they are not startup instructions for the current code.

Executed locally on 17 November 2026 against the completed PAW-49 through PAW-53 branch chain.

| Check | Result |
| --- | --- |
| Backend Java 21 package | Passed with backend tests skipped, using an isolated build directory to avoid IDE output interference |
| Frontend clean dependency install, lint, production build | Passed |
| Backend manual integration | 38 checks passed: authenticated access, upload validation, multipart limits, transactional creation/replay, failure recovery, cleanup retries/reference protection, QR decoding/regeneration, report replay, concurrent budgets, proxy handling, and authorized/idempotent removal |
| Migration and recovery | 12 checks passed: fresh/legacy migration behavior, explicit baseline requirement, preserved records/UUIDs, actual MySQL dump/restore, restored application reads, and production configuration validation |
| Session browser checks | 10 passed: refresh, expiry, profile hydration, stale/current 401 behavior, 403 handling, public access, and OAuth callback completion/error handling |
| Dialog browser checks | 7 passed: keyboard focus/Escape, small screens, nested cropping, photo validation, preview URL cleanup, busy saves, and removal confirmation |
| Production-build browser checks | 9 passed: navigation/deep links, responsive headers, QR recovery, stable creation/report retry keys, removal failure/retry, and admin filters/details/pagination |

Backend persistence checks used disposable schemas that were removed afterwards. Cloudinary and mail calls used fixtures; browser APIs used disposable responses. MySQL dump and restore used the installed MySQL clients. Mobile dashboard/admin screenshots were visually reviewed. Temporary verification scripts, fixtures, tooling, logs, and screenshots are excluded from commits.

These results do not establish live Google, Cloudinary, Brevo, hosting, TLS, or physical-phone behavior. Deployment preparation was subsequently deferred in PAW-54: the production profile, production settings validator, readiness endpoint, proxy example, and hosting instructions were removed. The configuration-validation result above records the earlier PAW-53 snapshot, not current production support. Separate backend security findings remain listed in [RELEASE.md](RELEASE.md). No backend unit tests or CI were added.

## Authentication/email follow-up - PAW-55 through PAW-59

Executed locally on 17 November 2026:

- Backend Java 21 package passed with test sources/execution skipped in an isolated output directory.
- Frontend lint and full build passed.
- 73 manual backend checks passed using a disposable MySQL schema and fixture mail transport. Coverage included upgrade from V3 to V6 while preserving accounts, reset-code transition, OAuth state/tampering/expiry, one-use browser-bound exchange, verified/conflicting/disabled identities, concurrent shared budgets, cooldown/exhaustion/expiry, concurrent one-use reset, live API rejection of pre-reset JWTs, outbox transaction rollback, encrypted/escaped content, cancellation of invalidated OTP mail, failure/retry, concurrent delivery leases, crash recovery, terminal failure, and expired jobs.
- 24 headless Chrome checks passed against the actual frontend with fixture API responses: owner/admin callback completion, single exchange under React effects, immediate query removal, disabled/invalid/expired callback recovery, complete password policy, inline field feedback, narrow layouts, and absence of runtime errors. A 320px registration screenshot was visually reviewed.

The temporary schema was removed. No live Google/Cloudinary/mail-provider calls were made. Temporary tooling, scripts, fixtures, screenshots, and logs are excluded from commits. New commit author and committer identities were verified as OnelDJ <oneldesilva868@gmail.com>; GitHub publishing uses the matching connector. Backend unit tests, CI, and deployment setup remain excluded.

## Hibernate schema follow-up - PAW-61

Flyway dependencies, settings, and all migration source files were removed. Hibernate uses `ddl-auto=update` and has entity mappings for counters and the mail outbox as well as the existing business tables. Backend packaging passed with tests skipped. Thirty-five temporary manual runtime checks passed against a fresh MySQL schema and a disposable legacy-schema fixture, including a repeated startup. Checks confirmed all required tables/defaults/indexes, preserved accounts/pet UUIDs/reports, no Flyway history or runtime library, working client/report budget SQL, mail outbox inserts, web/security startup, old-code rejection, new-code verification, and reset JWT revocation. Both disposable schemas were removed; the actual PawBack database was not changed and no external provider calls were made.

## Authentication input limits - PAW-63

On 18 November 2026, backend packaging with tests skipped and frontend lint/build passed. Twenty-three disposable HTTP/database checks verified 72-byte ASCII and multibyte registration/reset boundaries, controlled 400 field errors above those limits, 255-character registration fields, 256/1024-character rejection before SQL, no failed-registration rows, reset-code preservation on validation rejection, password login, and JWT revocation. Eleven browser checks verified matching field limits, oversized ASCII/multibyte feedback before requests, and exact valid passwords transmitted without truncation. The random database and temporary tooling were removed. A live Google sign-in with another eligible account reached the dashboard, confirmed by the user during the guided check. No backend unit tests, CI, Flyway, or deployment setup was added.
