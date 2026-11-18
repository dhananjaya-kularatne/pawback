import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { exchangeGoogleCode } from "../api/authApi";
import { clearSession, isTokenValid, saveSession } from "../utils/auth";

const GOOGLE_AUTH_ERRORS = {
  account_disabled: "This account has been disabled. Please contact support.",
  password_account: "This email already has a password account. Please sign in with your email and password.",
  identity_conflict: "This Google account does not match the identity saved for this email. Please contact support.",
  verified_identity_required: "Google could not verify your email address. Please use a verified Google account.",
};

export default function OAuth2RedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const completion = useRef(null);
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    // Remove callback credentials from browser history before any network request.
    window.history.replaceState(null, "", location.pathname);
    async function complete() {
      try {
        if (!code || params.has("error")) throw new Error("Invalid callback");
        completion.current ??= exchangeGoogleCode(code);
        const { token, user } = await completion.current;
        if (!isTokenValid(token)) throw new Error("Invalid session");
        if (!active) return;
        saveSession({ token, user });
        navigate(user.role === "ADMIN" ? "/admin" : "/dashboard", { replace: true });
      } catch {
        if (!active) return;
        clearSession();
        navigate("/", { replace: true, state: { authError: (Object.hasOwn(GOOGLE_AUTH_ERRORS, params.get("error")) ? GOOGLE_AUTH_ERRORS[params.get("error")] : null) || "Google sign-in could not be completed. Please try again." } });
      }
    }
    complete();
    return () => { active = false; };
  }, [location.pathname, location.search, navigate]);
  return <p className="p-8 text-center text-gray-600">Completing sign-in...</p>;
}
