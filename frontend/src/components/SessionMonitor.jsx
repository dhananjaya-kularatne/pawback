import { useEffect } from "react";
import { useSession } from "../utils/useSession";
import { getCurrentProfile } from "../api/authApi";
import { saveSession } from "../utils/auth";

export default function SessionMonitor() {
  const { token } = useSession();
  useEffect(() => {
    if (!token) return;
    let active = true;
    const refresh = async () => {
      try {
        const user = await getCurrentProfile(token);
        if (active && sessionStorage.getItem("token") === token) saveSession({ token, user });
      } catch { /* Authentication failures clear the session in the API helper. */ }
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => { active = false; window.removeEventListener("focus", refresh); };
  }, [token]);
  return null;
}
