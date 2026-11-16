import { useEffect, useSyncExternalStore } from "react";
import { clearSession, decodeJwt, getCurrentUser, isTokenValid, sessionSnapshot, subscribeSession } from "./auth";

export function useSession() {
  const snapshot = useSyncExternalStore(subscribeSession, sessionSnapshot, () => "[]");
  const [raw] = JSON.parse(snapshot);
  const valid = isTokenValid(raw);
  useEffect(() => {
    if (!raw) return;
    if (!isTokenValid(raw)) { if (sessionStorage.getItem("token") === raw) clearSession(); return; }
    const expire = () => { if (sessionStorage.getItem("token") === raw) clearSession(); };
    const timer = window.setTimeout(expire, Math.min(2147483647, Math.max(0, decodeJwt(raw).exp * 1000 - Date.now())));
    const check = () => { if (!isTokenValid(raw)) expire(); };
    window.addEventListener("focus", check);
    return () => { window.clearTimeout(timer); window.removeEventListener("focus", check); };
  }, [raw]);
  return { token: valid ? raw : null, user: getCurrentUser(), expired: Boolean(raw) && !valid };
}
