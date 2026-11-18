export const SESSION_EVENT = "pawback:session";

export function decodeJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch { return null; }
}
export function isTokenValid(token) {
  const payload = token ? decodeJwt(token) : null;
  return typeof payload?.exp === "number" && Number.isFinite(payload.exp) && payload.exp * 1000 > Date.now();
}
export function clearSession(expired = false) {
  if (expired) sessionStorage.setItem("pawback:session-expired", "1");
  else sessionStorage.removeItem("pawback:session-expired");
  const changed = sessionStorage.getItem("token") || sessionStorage.getItem("user");
  sessionStorage.removeItem("token"); sessionStorage.removeItem("user");
  if (changed) window.dispatchEvent(new Event(SESSION_EVENT));
}
export function saveSession({ token, user }) {
  if (!isTokenValid(token) || !user) throw new Error("The sign-in response was invalid. Please try again.");
  sessionStorage.removeItem("pawback:session-expired");
  const json = JSON.stringify(user);
  const changed = token !== sessionStorage.getItem("token") || json !== sessionStorage.getItem("user");
  sessionStorage.setItem("token", token); sessionStorage.setItem("user", json);
  if (changed) window.dispatchEvent(new Event(SESSION_EVENT));
}
export function getCurrentUser() {
  try { return isTokenValid(sessionStorage.getItem("token")) ? JSON.parse(sessionStorage.getItem("user") || "null") : null; }
  catch { return null; }
}
export function isAdmin() { return getCurrentUser()?.role === "ADMIN"; }
export function sessionSnapshot() { return JSON.stringify([sessionStorage.getItem("token"), sessionStorage.getItem("user"), sessionStorage.getItem("pawback:session-expired")]); }
export function subscribeSession(listener) {
  window.addEventListener(SESSION_EVENT, listener); window.addEventListener("storage", listener);
  return () => { window.removeEventListener(SESSION_EVENT, listener); window.removeEventListener("storage", listener); };
}
