# PawBack

Pet profiles, printable QR tags, finder reports, and an owner/admin dashboard.

## Local setup

Use Java 21, Node 22.17 or newer, npm, and MySQL 8.0 or newer. The Maven wrapper is included. Dependencies require internet access on the first install.

The backend settings are in [application.properties](backend/src/main/resources/application.properties). Save the values under Windows User environment variables, then fully reopen your IDE/terminal. Run the normal Maven command below; no dotenv loader or custom launcher is needed. Required local values are `DB_PASSWORD`, `JWT_SECRET`, the three `CLOUDINARY_*` values, and `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`. Use a private database account; `DB_URL` and `DB_USERNAME` override the local defaults. Do not commit real secrets.

Generate a random JWT secret rather than using a memorable password. For example, in PowerShell:

```powershell
$pawbackBytes = New-Object byte[] 64
$pawbackRng = [Security.Cryptography.RandomNumberGenerator]::Create()
$pawbackRng.GetBytes($pawbackBytes)
$env:JWT_SECRET = [Convert]::ToBase64String($pawbackBytes)
$pawbackRng.Dispose()
```

In the backend terminal:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

In a second terminal, copy `frontend/.env.example` to `frontend/.env.local` if different settings are needed, then:

```powershell
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. The API defaults to `http://localhost:8080/api`. `VITE_API_BASE_URL` is a **build-time** frontend setting; rebuild after changing it. The development and build commands use Vite's native config loader.

## Database setup

The project uses Hibernate schema updates through `spring.jpa.hibernate.ddl-auto=update` in `application.properties`. Start MySQL, set the database environment variables, and run the normal Maven command. Hibernate creates missing mapped tables/columns, including the report counters and mail queue. Existing account fields receive zero defaults where needed.

Back up an existing database before running changed entity mappings. If startup reports a schema-update error, inspect that error rather than deleting the database. Database recovery guidance is in [OPERATIONS.md](docs/OPERATIONS.md).

## Provider setup

- Google: configure authorized JavaScript origin `http://localhost:5173` and redirect URI `http://localhost:8080/login/oauth2/code/google` for local development.
- Cloudinary: supply the cloud name/API key/API secret. New uploads have tracked public IDs. Recovery jobs remove unused images and retry provider failures.
- Email: set `PAWBACK_BREVO_API_KEY`, `PAWBACK_BREVO_SENDER_EMAIL`, and optionally `PAWBACK_BREVO_SENDER_NAME`. The sender must be verified with the provider. Without a key, encrypted email jobs remain pending until configured or expired; OTPs are never logged. Live delivery has not been verified.

## Build and verify

```powershell
cd frontend
npm run lint
npm run build
npm run preview
```

```powershell
cd backend
.\mvnw.cmd package '-Dmaven.test.skip=true'
```

Backend unit tests and CI are outside the agreed project scope. [The local verification checklist](docs/RELEASE.md) covers application checks.

If the IDE rewrites `backend/target/classes` during a Maven build, stop its incremental builder or build in a separate checkout before verifying the artifact. Do not run a mixture of IDE-generated and Maven-generated classes.

## Product behavior

- Images: decoded JPEG/PNG only, at most 5 MiB, 4096 pixels per side, and 16 megapixels. Create/edit descriptions, instructions, and report messages support 255 characters; pet names/breeds support 100.
- Finder location is optional and must contain both latitude and longitude. Reports are accepted only while the pet is Lost.
- Report limits default to five submissions per client and twenty per pet per hour. Shared database counters work across app instances and expire automatically. Request keys prevent duplicate successful retries.
- Removing a pet disables its public QR lookup and removes its reports. Cloud cleanup is asynchronous. The internal pet row remains soft-deleted; backups follow the operator's retention policy.
- Owners can regenerate a QR image. If the public domain changes, old printed localhost/domain links cannot be repaired remotely: generate/download a new image and replace the physical tags.
- Report history is available from each pet's **View reports** action. The unfinished notification bell has been removed.

See [local database and recovery guidance](docs/OPERATIONS.md), [application checks](docs/RELEASE.md), and the public `/help` and `/privacy` pages. Deployment preparation is deferred.

Authentication, reset limits, Google identity rules, and mail recovery are described in [authentication and email behavior](docs/AUTHENTICATION.md). Deployment remains deferred.
