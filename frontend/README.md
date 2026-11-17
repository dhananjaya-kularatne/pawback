# PawBack frontend

React/Vite application. See the [project README](../README.md) for the complete setup and [operations guide](../docs/OPERATIONS.md) for deployment.

```powershell
npm ci
npm run dev
npm run lint
npm run build
npm run preview
```

Use Node 22.17 or newer. Optional `.env.local` settings are listed in `.env.example`:

- `VITE_API_BASE_URL`: API root, including `/api`. Use `/api` when the production web server proxies to the backend on the same origin.
- `VITE_SUPPORT_EMAIL`: real support address; leave empty to hide contact links.

Build-time settings require a rebuild. Serve `dist/` with an SPA fallback for dashboard, scan, information, and OAuth callback URLs. Vite preview is a local verification server, not the production web server.
