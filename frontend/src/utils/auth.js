// Small helpers for reading the signed-in user and their role out of
// sessionStorage. The login flow stores `user` (which carries a `role` field)
// alongside the JWT, so components can gate on role without re-decoding the token.

export function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

// True only when the stored user has the ADMIN role. The backend still enforces
// this on every /api/admin request — this is just for showing/hiding UI.
export function isAdmin() {
  return getCurrentUser()?.role === "ADMIN";
}
