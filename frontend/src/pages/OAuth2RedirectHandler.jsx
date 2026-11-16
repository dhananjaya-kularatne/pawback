import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCurrentProfile } from "../api/authApi";
import { clearSession, isTokenValid, saveSession } from "../utils/auth";

export default function OAuth2RedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    const token = new URLSearchParams(location.search).get("token");
    // Remove callback credentials from browser history before any network request.
    window.history.replaceState(null, "", location.pathname);
    async function complete() {
      try {
        if (!isTokenValid(token)) throw new Error("Invalid callback");
        const user = await getCurrentProfile(token);
        if (!active) return;
        saveSession({ token, user });
        navigate(user.role === "ADMIN" ? "/admin" : "/dashboard", { replace: true });
      } catch {
        if (!active) return;
        clearSession();
        navigate("/", { replace: true, state: { authError: "Google sign-in could not be completed. Please try again." } });
      }
    }
    complete();
    return () => { active = false; };
  }, [location.pathname, location.search, navigate]);
  return <p className="p-8 text-center text-gray-600">Completing sign-in...</p>;
}
