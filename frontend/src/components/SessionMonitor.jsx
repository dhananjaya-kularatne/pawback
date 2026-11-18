import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useSession } from "../utils/useSession";
import { getCurrentProfile } from "../api/authApi";
import { saveSession } from "../utils/auth";

export default function SessionMonitor() {
  const { token, expired } = useSession();
  const navigate = useNavigate();
  const handledExpiry = useRef(false);
  useEffect(() => {
    if (!expired) { handledExpiry.current = false; return; }
    if (handledExpiry.current) return;
    handledExpiry.current = true;
    navigate("/", { replace: true, state: { sessionExpired: true } });
  }, [expired, navigate]);
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
