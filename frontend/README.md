# PawBack frontend

React/Vite application. See the [project README](../README.md) for the complete setup.

```powershell
npm ci
npm run dev
npm run lint
npm run build
npm run preview
```

Use Node 22.17 or newer. Optional `.env.local` settings are listed in `.env.example`:

- `VITE_API_BASE_URL`: API root, including `/api`.
- `VITE_SUPPORT_EMAIL`: real support address; leave empty to hide contact links.

Build-time settings require a rebuild. `npm run preview` serves the built frontend for local verification. Deployment preparation is deferred.
